"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import VersionSelector from "../ui/VersionSelector";
import type { DiffItem } from "@/types/delivery";
import { ArrowLeft, Download, Settings } from "lucide-react";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import type { ProductItemSummary, Version } from "@/types/delivery";
import DiffTable from "@/components/feature/DiffTable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Define column configuration
export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  exportLabel?: string; // Optional label for CSV export
}

// Default column visibility configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "row", label: "Row", visible: true },
  { id: "productName", label: "Product Name", visible: true },
  { id: "qtyA", label: "Qty A", visible: true },
  { id: "qtyB", label: "Qty B", visible: true },
  { id: "delta", label: "Delta", visible: true },
  { id: "unitPriceA", label: "Unit Price Total (A)", visible: true },
  { id: "unitPriceB", label: "Unit Price Total (B)", visible: true },
  { id: "sellingPriceA", label: "Selling Price Total (A)", visible: false },
  { id: "sellingPriceB", label: "Selling Price Total (B)", visible: false },
  { id: "notesA", label: "Notes (A)", visible: false },
  { id: "notesB", label: "Notes (B)", visible: false },
];

export default function VersionComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const date = params.date as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");
  const [itemsA, setItemsA] = useState<ProductItemSummary[]>([]);
  const [itemsB, setItemsB] = useState<ProductItemSummary[]>([]);
  const [diffData, setDiffData] = useState<DiffItem[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Get selected version objects
  const selectedVersionA = versions.find((v) => v.id === versionA);
  const selectedVersionB = versions.find((v) => v.id === versionB);

  // Update column labels when versions are selected
  useEffect(() => {
    if (selectedVersionA || selectedVersionB) {
      setColumns(prevColumns =>
          prevColumns.map(col => {
            switch (col.id) {
              case "qtyA":
                return { ...col, label: `Qty ${selectedVersionA?.stepType || "A"}` };
              case "qtyB":
                return { ...col, label: `Qty ${selectedVersionB?.stepType || "B"}` };
              case "notesA":
                return { ...col, label: `Notes (${selectedVersionA?.stepType || "A"})` };
              case "notesB":
                return { ...col, label: `Notes (${selectedVersionB?.stepType || "B"})` };
              default:
                return col;
            }
          })
      );
    }
  }, [selectedVersionA, selectedVersionB]);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumns(prevColumns =>
        prevColumns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        )
    );
  };

  // Reset columns to default
  const resetColumns = () => {
    setColumns(DEFAULT_COLUMNS.map(col => ({ ...col })));
  };

  // Fetch versions metadata on mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoadingVersions(true);
        const companyId = "1"; // Replace with actual company ID from context/auth
        const data = await apiClient.get<ApiResponse<any[]>>(
            `company/${companyId}/productList?shopId=${shopId}&date=${date}`
        );
        // Extract the payload from the API response
        if (data && data.payload && Array.isArray(data.payload)) {
          // Map the payload to match the Version interface
          const mappedVersions = data.payload.map((item: any) => ({
            id: item.versionId.toString(),
            stepType: item.deliveryStepName,
            timestamp: new Date().toISOString(), // Using current date as timestamp is not provided in the API
            productListDetailsId: item.productListDetailsId.toString(),
            stepDescription: item.stepDescription || null,
          }));
          setVersions(mappedVersions);
        } else {
          console.error("Invalid API response format:", data);
          setVersions([]);
        }
      } catch (error) {
        console.error("Error fetching versions:", error);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [shopId, date]);

  // Fetch details when both versions are selected
  useEffect(() => {
    const fetchVersionDetails = async () => {
      if (!versionA || !versionB || !selectedVersionA || !selectedVersionB) {
        return;
      }

      setIsLoadingDetails(true);
      try {
        const companyId = "1"; // Replace with actual company ID from context/auth

        // Fetch both version details in parallel
        const [dataA, dataB] = await Promise.all([
          apiClient.get<ApiResponse<any[]>>(
              `company/${companyId}/productListItems/${selectedVersionA.productListDetailsId}`
          ),
          apiClient.get<ApiResponse<any[]>>(
              `company/${companyId}/productListItems/${selectedVersionB.productListDetailsId}`
          ),
        ]);

        // Map API response to ProductItem format
        const mappedItemsA = dataA.payload.map((item: any) => ({
          productId: item.itemId.toString(),
          name: item.itemName,
          quantity: item.quantity,
          notes: selectedVersionA.stepDescription,
          unitPrice: item.unitPrice,
          sellingPrice: item.sellingPrice
        }));

        const mappedItemsB = dataB.payload.map((item: any) => ({
          productId: item.itemId.toString(),
          name: item.itemName,
          quantity: item.quantity,
          notes: selectedVersionB.stepDescription,
          unitPrice: item.unitPrice,
          sellingPrice: item.sellingPrice
        }));

        setItemsA(mappedItemsA);
        setItemsB(mappedItemsB);

        // Create diff data
        createDiffData(mappedItemsA, mappedItemsB);
      } catch (error) {
        console.error("Error fetching version details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchVersionDetails();
  }, [versionA, versionB, selectedVersionA, selectedVersionB]);

  // Create diff data from both item lists
  const createDiffData = (itemsA: ProductItemSummary[], itemsB: ProductItemSummary[]) => {
    // Create a map of all product IDs from both lists
    const productMap = new Map<
        string,
        { name: string; inA: boolean; inB: boolean }
    >();

    itemsA.forEach((item) => {
      productMap.set(item.productId, {
        name: item.name,
        inA: true,
        inB: false,
      });
    });

    itemsB.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        productMap.set(item.productId, { ...existing, inB: true });
      } else {
        productMap.set(item.productId, {
          name: item.name,
          inA: false,
          inB: true,
        });
      }
    });

    // Create diff items
    const diff: DiffItem[] = [];

    productMap.forEach((product, productId) => {
      const itemA = itemsA.find((item) => item.productId === productId);
      const itemB = itemsB.find((item) => item.productId === productId);

      const qtyA = itemA ? itemA.quantity : null;
      const qtyB = itemB ? itemB.quantity : null;
      const delta = (qtyB ?? 0) - (qtyA ?? 0);

      diff.push({
        productId,
        name: product.name,
        qtyA,
        qtyB,
        delta,
        notesA: itemA?.notes || null,
        notesB: itemB?.notes || null,
      });
    });

    // Sort by delta (non-zero first), then by name
    diff.sort((a, b) => {
      // First sort by whether delta is non-zero
      if (a.delta !== 0 && b.delta === 0) return -1;
      if (a.delta === 0 && b.delta !== 0) return 1;

      // Then sort by name
      return a.name.localeCompare(b.name);
    });

    setDiffData(diff);
  };

  // Export to CSV with only visible columns
  const exportToCSV = () => {
    if (diffData.length === 0) return;

    const versionALabel = selectedVersionA
        ? `${selectedVersionA.stepType}`
        : "Version A";
    const versionBLabel = selectedVersionB
        ? `${selectedVersionB.stepType}`
        : "Version B";

    // Build headers based on visible columns
    const headers: string[] = [];
    const visibleColumns = columns.filter(col => col.visible);

    visibleColumns.forEach(col => {
      switch (col.id) {
        case "row":
          headers.push("Row");
          break;
        case "productName":
          headers.push("Product Name");
          break;
        case "qtyA":
          headers.push(`Qty ${versionALabel}`);
          break;
        case "qtyB":
          headers.push(`Qty ${versionBLabel}`);
          break;
        case "delta":
          headers.push("Delta");
          break;
        case "unitPriceA":
          headers.push(`Unit Price Total (${versionALabel})`);
          break;
        case "unitPriceB":
          headers.push(`Unit Price Total (${versionBLabel})`);
          break;
        case "sellingPriceA":
          headers.push(`Selling Price Total (${versionALabel})`);
          break;
        case "sellingPriceB":
          headers.push(`Selling Price Total (${versionBLabel})`);
          break;
        case "notesA":
          headers.push(`Notes (${versionALabel})`);
          break;
        case "notesB":
          headers.push(`Notes (${versionBLabel})`);
          break;
      }
    });

    const csvRows = [
      headers.join(","),
      ...diffData.map((item, index) => {
        const itemA = itemsA.find(i => i.productId === item.productId);
        const itemB = itemsB.find(i => i.productId === item.productId);

        const rowData: string[] = [];

        visibleColumns.forEach(col => {
          switch (col.id) {
            case "row":
              rowData.push((index + 1).toString());
              break;
            case "productName":
              rowData.push(`"${item.name}"`);
              break;
            case "qtyA":
              rowData.push(item.qtyA?.toString() ?? "");
              break;
            case "qtyB":
              rowData.push(item.qtyB?.toString() ?? "");
              break;
            case "delta":
              rowData.push(item.delta.toString());
              break;
            case "unitPriceA":
              rowData.push(
                  typeof itemA?.unitPrice === "number" && typeof itemA?.quantity === "number"
                      ? (itemA.unitPrice * itemA.quantity).toFixed(3)
                      : ""
              );
              break;
            case "unitPriceB":
              rowData.push(
                  typeof itemB?.unitPrice === "number" && typeof itemB?.quantity === "number"
                      ? (itemB.unitPrice * itemB.quantity).toFixed(3)
                      : ""
              );
              break;
            case "sellingPriceA":
              rowData.push(
                  typeof itemA?.sellingPrice === "number" && typeof itemA?.quantity === "number"
                      ? (itemA.sellingPrice * itemA.quantity).toFixed(3)
                      : ""
              );
              break;
            case "sellingPriceB":
              rowData.push(
                  typeof itemB?.sellingPrice === "number" && typeof itemB?.quantity === "number"
                      ? (itemB.sellingPrice * itemB.quantity).toFixed(3)
                      : ""
              );
              break;
            case "notesA":
              rowData.push(`"${item.notesA || ""}"`);
              break;
            case "notesB":
              rowData.push(`"${item.notesB || ""}"`);
              break;
          }
        });

        return rowData.join(",");
      })
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `version-comparison-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigate back to versions page
  const goBackToVersions = () => {
    router.push(`/shops/${shopId}/deliveries/${date}/versions`);
  };

  return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
              variant="ghost"
              onClick={goBackToVersions}
              className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Versions
          </Button>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.visible}
                        onCheckedChange={() => toggleColumn(column.id)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    onSelect={resetColumns}
                    className="text-sm"
                >
                  Reset to Default
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
                onClick={exportToCSV}
                disabled={diffData.length === 0 || isLoadingDetails}
                className="flex items-center gap-2"
            >
              <Download size={16} />
              Export to CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compare Delivery Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <VersionSelector
                  label="Compare A"
                  versions={versions}
                  value={versionA}
                  onChange={setVersionA}
                  disabled={isLoadingVersions}
              />
              <VersionSelector
                  label="Compare B"
                  versions={versions}
                  value={versionB}
                  onChange={setVersionB}
                  disabled={isLoadingVersions}
              />
            </div>

            {versionA && versionB ? (
                <div className="overflow-x-auto">
                  <DiffTable
                      diffData={diffData}
                      versionALabel={selectedVersionA?.stepType || "A"}
                      versionBLabel={selectedVersionB?.stepType || "B"}
                      itemsA={itemsA}
                      itemsB={itemsB}
                      isLoading={isLoadingDetails}
                      columns={columns}
                  />
                </div>
            ) : (
                <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">
                    {isLoadingVersions
                        ? "Loading versions..."
                        : "Select two versions to compare"}
                  </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}