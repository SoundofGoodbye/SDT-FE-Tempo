"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shop } from "@/types/company";
import { ProductActivation } from "@/types/product-activation";
import { Store, MapPin } from "lucide-react";

interface ShopSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shopIds: string[]) => void;
  shops: Shop[];
  product: ProductActivation | null | undefined;
}

export default function ShopSelectModal({
  isOpen,
  onClose,
  onConfirm,
  shops,
  product,
}: ShopSelectModalProps) {
  const [selectedShops, setSelectedShops] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      // Pre-select currently active shops
      setSelectedShops(product.activeShops);
    }
  }, [product]);

  const handleShopToggle = (shopId: string) => {
    setSelectedShops((prev) =>
      prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId],
    );
  };

  const handleSelectAll = () => {
    const activeShopIds = shops
      .filter((shop) => shop.status === "Active")
      .map((shop) => shop.id);
    setSelectedShops(activeShopIds);
  };

  const handleDeselectAll = () => {
    setSelectedShops([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedShops);
    onClose();
  };

  const activeShops = shops.filter((shop) => shop.status === "Active");
  const selectedCount = selectedShops.length;
  const totalActiveShops = activeShops.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Shops for Activation</DialogTitle>
          <DialogDescription>
            {product && (
              <div className="mt-2">
                <div className="font-medium">{product.productName}</div>
                <div className="text-sm text-muted-foreground">
                  {product.productCode}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedCount} of {totalActiveShops} shops selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedCount === totalActiveShops}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedCount === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activeShops.map((shop) => {
              const isSelected = selectedShops.includes(shop.id);
              const wasAlreadyActive =
                product?.activeShops.includes(shop.id) || false;

              return (
                <div
                  key={shop.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleShopToggle(shop.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleShopToggle(shop.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="font-medium truncate">{shop.name}</div>
                      {wasAlreadyActive && (
                        <Badge variant="secondary" className="text-xs">
                          Currently Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeShops.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active shops available</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedCount === 0}>
            Activate in {selectedCount} Shop{selectedCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
