import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { DiffItem, ProductItemSummary } from "@/types/delivery";

interface DiffTableProps {
  diffData: DiffItem[];
  versionALabel: string;
  versionBLabel: string;
  isLoading?: boolean;
  itemsA?: ProductItemSummary[]; // needed for price totals
  itemsB?: ProductItemSummary[];
}

export default function DiffTable({
                                    diffData,
                                    versionALabel,
                                    versionBLabel,
                                    isLoading = false,
                                    itemsA = [],
                                    itemsB = [],
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

  return (
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead className="w-[200px]">Product Name</TableHead>
              <TableHead className="text-right">Qty {versionALabel}</TableHead>
              <TableHead className="text-right">Qty {versionBLabel}</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Δ</TableHead>
              <TableHead className="text-right">Unit Price Total (A)</TableHead>
              <TableHead className="text-right">Unit Price Total (B)</TableHead>
              <TableHead className="text-right">Selling Price Total (A)</TableHead>
              <TableHead className="text-right">Selling Price Total (B)</TableHead>
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
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.qtyA ?? "-"}</TableCell>
                    <TableCell className="text-right">{item.qtyB ?? "-"}</TableCell>
                    <TableCell className="text-right font-semibold hidden sm:table-cell">
                      {item.delta > 0 ? `+${item.delta}` : item.delta}
                    </TableCell>
                    <TableCell className="text-right">
                      {a?.unitPrice && a?.quantity ? (a.unitPrice * a.quantity).toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {b?.unitPrice && b?.quantity ? (b.unitPrice * b.quantity).toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {a?.sellingPrice && a?.quantity ? (a.sellingPrice * a.quantity).toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {b?.sellingPrice && b?.quantity ? (b.sellingPrice * b.quantity).toFixed(3) : "-"}
                    </TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
  );
}
