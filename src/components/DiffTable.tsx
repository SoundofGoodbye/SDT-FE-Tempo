import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface DiffItem {
  productId: string;
  name: string;
  qtyA: number | null;
  qtyB: number | null;
  delta: number;
  notesA: string | null;
  notesB: string | null;
}

interface DiffTableProps {
  diffData: DiffItem[];
  versionALabel: string;
  versionBLabel: string;
  isLoading?: boolean;
}

export default function DiffTable({
  diffData,
  versionALabel,
  versionBLabel,
  isLoading = false,
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Row</TableHead>
            <TableHead className="w-[200px]">Product Name</TableHead>
            <TableHead className="text-right">Qty {versionALabel}</TableHead>
            <TableHead className="text-right">Qty {versionBLabel}</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Δ</TableHead>
            <TableHead>Notes {versionALabel}</TableHead>
            <TableHead>Notes {versionBLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diffData.map((item, index) => (
            <TableRow
              key={item.productId}
              className={
                item.delta !== 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
              }
            >
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.qtyA ?? "-"}</TableCell>
              <TableCell className="text-right">{item.qtyB ?? "-"}</TableCell>
              <TableCell className="text-right font-semibold hidden sm:table-cell">
                {item.delta > 0 ? `+${item.delta}` : item.delta}
              </TableCell>
              <TableCell>{item.notesA || "-"}</TableCell>
              <TableCell>{item.notesB || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
