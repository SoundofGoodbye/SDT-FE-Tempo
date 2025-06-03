import React, {useState} from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";

import type { ProductItem } from "@/types/delivery";

type VersionListProps = {
  items: ProductItem[];
  isLoading: boolean;
  showExportAsCsvFile: boolean;
  companyId?: string;
  shopId?: string;
  date?: string;
};

export const VersionList: React.FC<VersionListProps> = ({
  items = [],
  isLoading = false,
  showExportAsCsvFile = false,
  companyId,
  shopId,
  date,
}) => {

  const showExportCsv = shopId != undefined && date != undefined && companyId != undefined;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadCsvFile = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response: any = await apiClient.get(
        `/company/${companyId}/productList/csv-file?shopId=${shopId}&date=${date}`,
        {
          responseType: 'blob',
          headers: {'Accept': 'text/csv, application/octet-stream'}
        }
      );

      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'text/csv;charset=utf-8'
      });

      // Get filename from response headers if available
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `products-${date}.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      console.log('CSV file downloaded successfully');

    } catch (error: any) {
      console.error('Error downloading CSV file:', error);

      let errorMessage = 'Failed to download CSV file';

      if (error.response) {
        // Server responded with error status
        errorMessage = `Download failed: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }

      setDownloadError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white p-4 rounded-md shadow-sm">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading product list...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-md shadow-sm">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No products for this version.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Product List</h3>
        {showExportAsCsvFile && showExportCsv && (
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleDownloadCsvFile}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export CSV
                </>
              )}
            </Button>

            {downloadError && (
              <p className="text-sm text-red-600 max-w-xs text-right">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Row</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-right">Qty Ordered</TableHead>
            <TableHead className="text-right">Qty Actual</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-right">{item.qtyOrdered}</TableCell>
              <TableCell className="text-right">{item.qtyActual}</TableCell>
              <TableCell className="text-right">{item.notes}</TableCell>
              <TableCell>{(item.price * item.qtyActual).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
