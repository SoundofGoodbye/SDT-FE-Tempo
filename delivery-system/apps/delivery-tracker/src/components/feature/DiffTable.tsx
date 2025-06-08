// delivery-system/apps/delivery-tracker/src/components/feature/DiffTable.tsx
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@delivery-system/ui-components";
import type { DiffItem, ProductItemSummary } from "@delivery-system/types";
import type { ColumnConfig } from "./VersionComparisonPage";

interface DiffTableProps {
    diffData: DiffItem[];
    versionALabel: string;
    versionBLabel: string;
    isLoading?: boolean;
    itemsA?: ProductItemSummary[];
    itemsB?: ProductItemSummary[];
    columns: ColumnConfig[];
}

export default function DiffTable({
                                      diffData,
                                      versionALabel,
                                      versionBLabel,
                                      isLoading = false,
                                      itemsA = [],
                                      itemsB = [],
                                      columns,
                                  }: DiffTableProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (diffData.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                    No differences found between versions
                </p>
            </div>
        );
    }

    // Helper function to check if a column is visible
    const isColumnVisible = (columnId: string) => {
        const column = columns.find(col => col.id === columnId);
        return column?.visible ?? true;
    };

    return (
        <div className="rounded-md border overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {isColumnVisible("row") && <TableHead>Row</TableHead>}
                        {isColumnVisible("productName") && (
                            <TableHead className="w-[200px]">Product Name</TableHead>
                        )}
                        {isColumnVisible("qtyA") && (
                            <TableHead className="text-right">Qty {versionALabel}</TableHead>
                        )}
                        {isColumnVisible("qtyB") && (
                            <TableHead className="text-right">Qty {versionBLabel}</TableHead>
                        )}
                        {isColumnVisible("delta") && (
                            <TableHead className="text-right hidden sm:table-cell">Δ</TableHead>
                        )}
                        {isColumnVisible("unitPriceA") && (
                            <TableHead className="text-right">Unit Price Total (A)</TableHead>
                        )}
                        {isColumnVisible("unitPriceB") && (
                            <TableHead className="text-right">Unit Price Total (B)</TableHead>
                        )}
                        {isColumnVisible("sellingPriceA") && (
                            <TableHead className="text-right">Selling Price Total (A)</TableHead>
                        )}
                        {isColumnVisible("sellingPriceB") && (
                            <TableHead className="text-right">Selling Price Total (B)</TableHead>
                        )}
                        {isColumnVisible("notesA") && (
                            <TableHead>Notes ({versionALabel})</TableHead>
                        )}
                        {isColumnVisible("notesB") && (
                            <TableHead>Notes ({versionBLabel})</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {diffData.map((item, index) => {
                        const a = itemsA.find(i => i.productId === item.productId);
                        const b = itemsB.find(i => i.productId === item.productId);

                        return (
                            <TableRow
                                key={item.productId}
                                className={item.delta !== 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                            >
                                {isColumnVisible("row") && (
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                )}
                                {isColumnVisible("productName") && (
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                )}
                                {isColumnVisible("qtyA") && (
                                    <TableCell className="text-right">{item.qtyA ?? "-"}</TableCell>
                                )}
                                {isColumnVisible("qtyB") && (
                                    <TableCell className="text-right">{item.qtyB ?? "-"}</TableCell>
                                )}
                                {isColumnVisible("delta") && (
                                    <TableCell className="text-right font-semibold hidden sm:table-cell">
                                        {item.delta > 0 ? `+${item.delta}` : item.delta}
                                    </TableCell>
                                )}
                                {isColumnVisible("unitPriceA") && (
                                    <TableCell className="text-right">
                                        {a?.unitPrice && a?.quantity ? (a.unitPrice * a.quantity).toFixed(3) : "-"}
                                    </TableCell>
                                )}
                                {isColumnVisible("unitPriceB") && (
                                    <TableCell className="text-right">
                                        {b?.unitPrice && b?.quantity ? (b.unitPrice * b.quantity).toFixed(3) : "-"}
                                    </TableCell>
                                )}
                                {isColumnVisible("sellingPriceA") && (
                                    <TableCell className="text-right">
                                        {a?.sellingPrice && a?.quantity ? (a.sellingPrice * a.quantity).toFixed(3) : "-"}
                                    </TableCell>
                                )}
                                {isColumnVisible("sellingPriceB") && (
                                    <TableCell className="text-right">
                                        {b?.sellingPrice && b?.quantity ? (b.sellingPrice * b.quantity).toFixed(3) : "-"}
                                    </TableCell>
                                )}
                                {isColumnVisible("notesA") && (
                                    <TableCell>{item.notesA || "-"}</TableCell>
                                )}
                                {isColumnVisible("notesB") && (
                                    <TableCell>{item.notesB || "-"}</TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}