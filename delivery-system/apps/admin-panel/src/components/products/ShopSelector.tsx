"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Store, Package, Calendar, User } from "lucide-react";
import { useShopList } from "@/hooks/useShopList";
import { useImportWizard } from "./ImportWizardContext";

interface ShopSelectorProps {
  companyId: string;
  companyName: string;
}

export default function ShopSelector({
  companyId,
  companyName,
}: ShopSelectorProps) {
  const { allShops } = useShopList(companyId);
  const { state, updateState } = useImportWizard();

  // Mock data for company info
  const companyInfo = {
    currentCatalog: 245,
    version: 23,
    lastImport: "Feb 5, 2024",
    lastImportBy: "Jane Smith",
    nextVersion: 24,
  };

  // Mock shop data with more details
  const shopsWithDetails = [
    { id: "1", name: "Downtown", subtitle: "Main", active: true },
    { id: "2", name: "Mall Branch", subtitle: "", active: true },
    { id: "3", name: "Airport", subtitle: "", active: false },
    { id: "4", name: "Station", subtitle: "", active: false },
    { id: "5", name: "University", subtitle: "", active: false },
  ];

  const handleSelectionModeChange = (mode: "all" | "select") => {
    updateState({
      shopSelectionMode: mode,
      selectedShops: mode === "all" ? shopsWithDetails.map((s) => s.id) : [],
    });
  };

  const handleShopToggle = (shopId: string, checked: boolean) => {
    const newSelectedShops = checked
      ? [...state.selectedShops, shopId]
      : state.selectedShops.filter((id) => id !== shopId);
    updateState({ selectedShops: newSelectedShops });
  };

  return (
    <div className="space-y-6 bg-background">
      {/* Company Info Card */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {companyName} - Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  {companyInfo.currentCatalog} products
                </div>
                <div className="text-xs text-muted-foreground">
                  Version {companyInfo.version}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  {companyInfo.lastImport}
                </div>
                <div className="text-xs text-muted-foreground">Last import</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  {companyInfo.lastImportBy}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated by
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Auto-note:</strong> This will create Version{" "}
              {companyInfo.nextVersion}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shop Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Select Target Shops
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Mode */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Shop Selection
            </Label>
            <RadioGroup
              value={state.shopSelectionMode}
              onValueChange={handleSelectionModeChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-shops" />
                <Label htmlFor="all-shops" className="text-sm">
                  All Shops
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="select-shops" />
                <Label htmlFor="select-shops" className="text-sm">
                  Select Shops
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Shop List */}
          {state.shopSelectionMode === "select" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose Shops:</Label>
              <div className="space-y-2">
                {shopsWithDetails.map((shop) => (
                  <div
                    key={shop.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`shop-${shop.id}`}
                      checked={state.selectedShops.includes(shop.id)}
                      onCheckedChange={(checked) =>
                        handleShopToggle(shop.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`shop-${shop.id}`}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      <span className="font-medium">{shop.name}</span>
                      {shop.subtitle && (
                        <span className="text-muted-foreground ml-1">
                          ({shop.subtitle})
                        </span>
                      )}
                    </Label>
                    {shop.active && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection Summary */}
          <div className="mt-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Selected:</strong>{" "}
              {state.shopSelectionMode === "all"
                ? `All shops (${shopsWithDetails.length})`
                : `${state.selectedShops.length} of ${shopsWithDetails.length} shops`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
