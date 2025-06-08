"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  Download,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import ProductSummaryCards from "@/components/products/ProductSummaryCards";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import { useAllCompanyProducts } from "@/hooks/useAllCompanyProducts";
import { useMyCompanyProducts } from "@/hooks/useMyCompanyProducts";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user role
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    setIsLoading(false);
  }, []);

  const isAdmin = userRole === "admin";

  // Use appropriate hook based on user role
  const adminHook = useAllCompanyProducts();
  const managerHook = useMyCompanyProducts();

  const hook = isAdmin ? adminHook : managerHook;

  const {
    products,
    filters,
    stats,
    updateFilters,
    updateSort,
    sortOption,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
  } = hook;

  // Get additional data based on role
  const categories = isAdmin
    ? adminHook.getUniqueCategories()
    : managerHook.getUniqueCategories();
  const companies = isAdmin ? adminHook.getUniqueCompanies() : [];
  const shops = !isAdmin ? managerHook.getAvailableShops() : [];
  const companyName = !isAdmin ? managerHook.companyName : undefined;

  const handleEdit = (product: Product) => {
    console.log("Edit product:", product);
    // TODO: Open edit modal
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      if (isAdmin) {
        adminHook.deleteProduct(id);
      } else {
        managerHook.deleteProduct(id);
      }
    }
  };

  const handleCopyToCompany = (productId: string, companyId: string) => {
    if (isAdmin) {
      adminHook.copyToCompany(productId, companyId);
    }
  };

  const handleDuplicate = (id: string) => {
    if (!isAdmin) {
      managerHook.duplicateProduct(id);
    }
  };

  const handleActivateInShop = (productId: string, shopId: string) => {
    if (!isAdmin) {
      managerHook.activateInShop(productId, shopId);
    }
  };

  const handleDeactivate = (id: string) => {
    if (!isAdmin) {
      managerHook.deactivateProduct(id);
    }
  };

  const handleSort = (field: string) => {
    const newDirection =
      sortOption.field === field && sortOption.direction === "asc"
        ? "desc"
        : "asc";
    updateSort({ field: field as any, direction: newDirection });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin
              ? "Products Management (All Companies)"
              : `Products Management - ${companyName}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Manage products across all companies in the system"
              : "Manage your company's product catalog and shop availability"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <ProductSummaryCards
        stats={stats}
        isAdmin={isAdmin}
        companyName={companyName}
      />

      {/* Filters */}
      <ProductFilters
        filters={filters}
        onFiltersChange={updateFilters}
        categories={categories}
        companies={companies}
        shops={shops}
        isAdmin={isAdmin}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {products.length} of {totalItems} products
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("name")}
            className="flex items-center gap-1"
          >
            Name
            {sortOption.field === "name" &&
              (sortOption.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("price")}
            className="flex items-center gap-1"
          >
            Price
            {sortOption.field === "price" &&
              (sortOption.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("lastUpdated")}
            className="flex items-center gap-1"
          >
            Updated
            {sortOption.field === "lastUpdated" &&
              (sortOption.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <ProductTable
        products={products}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopyToCompany={handleCopyToCompany}
        onDuplicate={handleDuplicate}
        onActivateInShop={handleActivateInShop}
        onDeactivate={handleDeactivate}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
