import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export type ProductItem = {
  id: string;
  productName: string;
  qtyOrdered: number;
  qtyActual: number;
  notes: string;
};

type VersionListProps = {
  items: ProductItem[];
  isLoading: boolean;
};

export const VersionList: React.FC<VersionListProps> = ({
  items = [],
  isLoading = false,
}) => {
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
          <p className="text-gray-500">No products found for this version</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Product List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-right">Qty Ordered</TableHead>
            <TableHead className="text-right">Qty Actual</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-right">{item.qtyOrdered}</TableCell>
              <TableCell className="text-right">{item.qtyActual}</TableCell>
              <TableCell>{item.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
