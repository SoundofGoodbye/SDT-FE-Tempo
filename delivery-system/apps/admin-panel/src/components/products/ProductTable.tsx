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
import {
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Upload,
  Download,
  Package,
  Building2,
  Store,
  Play,
  Pause,
  Files,
  TrendingUp,
} from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onCopyToCompany?: (productId: string, companyId: string) => void;
  onDuplicate?: (id: string) => void;
  onActivateInShop?: (productId: string, shopId: string) => void;
  onDeactivate?: (id: string) => void;
}

export default function ProductTable({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onCopyToCompany,
  onDuplicate,
  onActivateInShop,
  onDeactivate,
}: ProductTableProps) {
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

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground text-center">
            No products match your current filters. Try adjusting your search or
            filter criteria.
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                {isAdmin ? (
                  <TableHead>Company</TableHead>
                ) : (
                  <TableHead>Shops</TableHead>
                )}
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Last Updated</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">
                      {product.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  {isAdmin ? (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{product.companyName}</span>
                      </div>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.shopNames.length > 0 ? (
                          product.shopNames.map((shopName, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {shopName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No shops
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <Badge variant={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    <div>{formatDate(product.lastUpdated)}</div>
                    <div className="text-xs">by {product.updatedBy}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 p-0"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyToCompany?.(product.id, "1")}
                            className="h-8 w-8 p-0"
                            title="Copy to Another Company"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Cross-Company Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Manager Actions */}
                      {!isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDuplicate?.(product.id)}
                            className="h-8 w-8 p-0"
                            title="Duplicate Product"
                          >
                            <Files className="h-4 w-4" />
                          </Button>
                          {product.status === "Active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeactivate?.(product.id)}
                              className="h-8 w-8 p-0"
                              title="Deactivate Product"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onActivateInShop?.(product.id, "1")
                              }
                              className="h-8 w-8 p-0"
                              title="Activate in Shop"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Performance"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
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
