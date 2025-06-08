// ProductListImportResults.tsx
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface ImportWarning {
    rowNumber: number;
    productName: string;
    message: string;
}

interface ImportResults {
    productListDetailsId: number;
    productListNumber: string;
    successCount: number;
    errorCount: number;
    warnings: ImportWarning[];
}

interface ProductListImportResultsProps {
    isOpen: boolean;
    onClose: () => void;
    results: ImportResults | null;
    onImportAnother: () => void;
}

export const ProductListImportResults: React.FC<ProductListImportResultsProps> = ({
                                                                                      isOpen,
                                                                                      onClose,
                                                                                      results,
                                                                                      onImportAnother
                                                                                  }) => {
    if (!results) return null;

    const hasWarnings = results.warnings && results.warnings.length > 0;
    const isCompleteSuccess = results.errorCount === 0 && !hasWarnings;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Import Results</DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    {/* Summary */}
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            {isCompleteSuccess ? (
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                            ) : (
                                <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
                            )}
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Product List #{results.productListNumber} Imported
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Successfully imported {results.successCount} products
                                    {results.errorCount > 0 && `, ${results.errorCount} failed`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {hasWarnings && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Warnings:</h4>
                            <div className="max-h-48 overflow-y-auto">
                                <div className="space-y-2">
                                    {results.warnings.map((warning, index) => (
                                        <div
                                            key={index}
                                            className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded"
                                        >
                                            <span className="font-medium">Row {warning.rowNumber}:</span>{' '}
                                            {warning.productName} - {warning.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={onImportAnother}
                        >
                            Import Another
                        </Button>
                        <Button
                            onClick={onClose}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
export default ProductListImportResults;