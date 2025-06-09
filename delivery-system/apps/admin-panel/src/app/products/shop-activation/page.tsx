"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import ActivationTable from "@/components/products/ActivationTable";
import ShopSelectModal from "@/components/products/ShopSelectModal";
import ActivationHistoryTable from "@/components/products/ActivationHistoryTable";
import { useProductActivationList } from "@/hooks/useProductActivationList";
import { useActivationHistory } from "@/hooks/useActivationHistory";
import { useShopList } from "@/hooks/useShopList";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Package, Store, TrendingUp, Clock } from "lucide-react";
import { hasRole, getCompanyId } from "@delivery-system/api-client";

export default function ShopActivationPage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
      null,
  );
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const { toast } = useToast();

  // Get user role and company from auth
  const isManager = hasRole("MANAGER");
  const isAdmin = hasRole("ADMIN");
  const userCompanyId = getCompanyId();

  // Check access permissions
  if (!isAdmin && (!isManager || !userCompanyId)) {
    return (
        <ForbiddenPage
            title="Access Denied"
            description="You need to be assigned to a company to manage product activations. Please contact your administrator."
        />
    );
  }

  // For admins, we need to handle company selection differently
  // For now, use a default company ID, but this should be improved
  const companyId = userCompanyId?.toString() || "1";

  const { products, activateInShops, activateInAllShops } =
      useProductActivationList(companyId);

  const {
    history,
    currentPage,
    totalPages,
    totalItems,
    addHistoryEntry,
    goToPage,
  } = useActivationHistory(companyId);

  const { allShops } = useShopList(companyId);

  const handleActivateAll = (productId: string) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    activateInAllShops(productId);

    // Add to history
    addHistoryEntry({
      productId,
      productCode: product.productCode,
      productName: product.productName,
      action: "Activated",
      shopNames: allShops
          .filter((shop) => shop.status === "Active")
          .map((shop) => shop.name),
    });

    toast({
      title: "Product Activated",
      description: `${product.productName} has been activated in all shops.`,
    });
  };

  const handleSelectShops = (productId: string) => {
    setSelectedProductId(productId);
    setIsShopModalOpen(true);
  };

  const handleShopSelection = (shopIds: string[]) => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.productId === selectedProductId);
    if (!product) return;

    activateInShops(selectedProductId, shopIds);

    // Add to history
    const selectedShopNames = shopIds.map(
        (shopId) =>
            allShops.find((shop) => shop.id === shopId)?.name || "Unknown Shop",
    );

    addHistoryEntry({
      productId: selectedProductId,
      productCode: product.productCode,
      productName: product.productName,
      action: "Assigned to shops",
      shopNames: selectedShopNames,
    });

    toast({
      title: "Shops Updated",
      description: `${product.productName} activation updated for selected shops.`,
    });

    setSelectedProductId(null);
  };

  const selectedProduct = selectedProductId
      ? products.find((p) => p.productId === selectedProductId)
      : null;

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    newlyImported: products.filter((p) => p.isNewlyImported).length,
    partiallyActive: products.filter((p) => p.status === "Partial").length,
    inactive: products.filter((p) => p.status === "None").length,
  };

  return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Shop Activation
              </h1>
              <p className="text-muted-foreground">
                Manage product activation across your shops
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {stats.totalProducts}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Products Pending
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {stats.newlyImported}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Newly Imported
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Store className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {stats.partiallyActive}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Partially Active
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.inactive}</div>
                      <div className="text-sm text-muted-foreground">
                        Inactive
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New / Modified Products Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">New / Modified Products</h2>
              {stats.newlyImported > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {stats.newlyImported} newly imported
                  </Badge>
              )}
            </div>

            <ActivationTable
                products={products}
                onActivateAll={handleActivateAll}
                onSelectShops={handleSelectShops}
            />
          </div>

          {/* Activation History Section */}
          <div className="space-y-4">
            <ActivationHistoryTable
                history={history}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={goToPage}
            />
          </div>

          {/* Shop Selection Modal */}
          <ShopSelectModal
              isOpen={isShopModalOpen}
              onClose={() => {
                setIsShopModalOpen(false);
                setSelectedProductId(null);
              }}
              onConfirm={handleShopSelection}
              shops={allShops}
              product={selectedProduct}
          />
        </div>
      </div>
  );
}