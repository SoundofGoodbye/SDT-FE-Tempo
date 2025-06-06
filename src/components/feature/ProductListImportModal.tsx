import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStoredTokens, getUserEmail } from "@/lib/api/auth-service";
import { useToast } from '@/components/notifications/toast-system';
import { ProductListImportResults } from './ProductListImportResults';

interface ProductListImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  shopId: number;
  onImportSuccess: () => void;
}

interface ImportResponse {
  productListDetailsId: number;
  productListNumber: string;
  successCount: number;
  errorCount: number;
  warnings: Array<{
    rowNumber: number;
    productName: string;
    message: string;
  }>;
}

export const ProductListImportModal: React.FC<ProductListImportModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                companyId,
                                                                                shopId,
                                                                                onImportSuccess
                                                                              }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { showToast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      const errorMessage = rejectedFile.errors?.[0]?.message || 'Invalid file type';

      setError(`${rejectedFile.file.name}: ${errorMessage}`);
      showToast({
        type: 'error',
        title: 'Invalid File',
        description: 'Please select an Excel (.xlsx, .xls) or CSV file.',
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
      showToast({
        type: 'success',
        title: 'File Selected',
        description: `${acceptedFiles[0].name} ready for import`,
        duration: 3000
      });
    }
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);

    // Show importing notification
    showToast({
      type: 'info',
      title: 'Importing File',
      description: `Processing ${selectedFile.name}...`,
      duration: 0 // Don't auto-dismiss
    });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('importedBy', getUserEmail() || 'unknown@email.com');

    try {
      const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}/company/${companyId}/shops/${shopId}/product-lists/import/file`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getStoredTokens()?.accessToken}`
            },
            body: formData
          }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }

      const result: ImportResponse = await response.json();
      setImportResults(result);

      // Show appropriate notification based on results
      if (result.errorCount === 0 && (!result.warnings || result.warnings.length === 0)) {
        showToast({
          type: 'success',
          title: 'Import Successful',
          description: `Successfully imported ${result.successCount} products to list #${result.productListNumber}`,
          action: {
            label: 'View List',
            onClick: () => {
              window.location.href = `/product-lists/${result.productListDetailsId}`;
            }
          }
        });

        // If complete success, close after a delay
        setTimeout(() => {
          onImportSuccess();
          handleClose();
        }, 2000);
      } else {
        // Show results modal for warnings or errors
        setShowResults(true);

        if (result.errorCount > 0) {
          showToast({
            type: 'error',
            title: 'Import Failed',
            description: `${result.errorCount} products failed to import. Check the details.`,
          });
        } else if (result.warnings && result.warnings.length > 0) {
          showToast({
            type: 'warning',
            title: 'Import Completed with Warnings',
            description: `Imported ${result.successCount} products with ${result.warnings.length} warnings.`,
          });
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Import Failed',
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: handleImport
        }
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setImportResults(null);
    setShowResults(false);
    onClose();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    onImportSuccess();
    handleClose();
  };

  const resetForNewImport = () => {
    setImportResults(null);
    setSelectedFile(null);
    setError(null);
    setShowResults(false);
    showToast({
      type: 'info',
      title: 'Ready for New Import',
      description: 'You can now select another file to import.',
      duration: 3000
    });
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    showToast({
      type: 'info',
      title: 'File Removed',
      description: 'Select a new file to continue.',
      duration: 2000
    });
  };

  return (
      <>
        <Dialog open={isOpen && !showResults} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Import Product List</DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4">
              <div
                  {...getRootProps()}
                  className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragActive
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : selectedFile
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                  }
              `}
              >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="mt-3 text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                      <Upload className={`w-12 h-12 mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-600 mb-1">
                        {isDragActive
                            ? 'Drop the file here...'
                            : 'Drag & drop a file here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: Excel (.xlsx, .xls) or CSV
                      </p>
                    </div>
                )}
              </div>

              {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importing}
                >
                  {importing ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Importing...
                      </>
                  ) : (
                      'Import'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Use the separate ProductListImportResults component */}
        <ProductListImportResults
            isOpen={showResults}
            onClose={handleCloseResults}
            results={importResults}
            onImportAnother={resetForNewImport}
        />
      </>
  );
};