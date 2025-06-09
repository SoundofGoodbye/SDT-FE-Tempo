"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronDown, Zap, Sparkles } from "lucide-react";
import { ProductActivation } from "@/types/product-activation";
import { cn } from "@/lib/utils";

interface ActivationTableProps {
  products: ProductActivation[];
  onActivateAll: (productId: string) => void;
  onSelectShops: (productId: string) => void;
}

export default function ActivationTable({
  products,
  onActivateAll,
  onSelectShops,
}: ActivationTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: ProductActivation["status"]) => {
    switch (status) {
      case "Full":
        return "default";
      case "Partial":
        return "secondary";
      case "None":
        return "outline";
      default:
        return "outline";
    }
  };

  const getActiveShopsText = (product: ProductActivation) => {
    if (product.activeShops.length === 0) {
      return "Not active";
    }
    if (product.activeShops.length === product.totalShops) {
      return "All shops";
    }
    return product.activeShopNames.join(", ") + " only";
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            All products are activated
          </h3>
          <p className="text-muted-foreground text-center">
            All your products are currently active in all shops. New or modified
            products will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Active In</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Last Modified</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(
                    product.isNewlyImported &&
                      "bg-blue-50/50 border-l-4 border-l-blue-500",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.isNewlyImported && (
                        <Sparkles
                          className="h-4 w-4 text-blue-500"
                          title="Newly imported"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        <div className="font-mono text-sm text-muted-foreground">
                          {product.productCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getActiveShopsText(product)}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.activeShops.length} of {product.totalShops} shops
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusColor(product.status)}>
                      {product.status === "None" ? "Inactive" : product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatDate(product.lastModified)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onActivateAll(product.productId)}
                        className="flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        Activate All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectShops(product.productId)}
                        className="flex items-center gap-1"
                      >
                        Select Shops
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
