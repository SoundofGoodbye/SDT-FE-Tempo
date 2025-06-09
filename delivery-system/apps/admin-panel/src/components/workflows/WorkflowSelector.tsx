//delivery-system/apps/admin-panel/src/components/workflows/WorkflowSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { useShops } from "@delivery-system/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Store } from "lucide-react";
import { cn } from "@/lib/utils";



interface WorkflowSelectorProps {
  selectedCompanyId: string;
  selectedShopId?: string;
  onWorkflowChange: (companyId: string, shopId?: string) => void;
  className?: string;
}

export default function WorkflowSelector({
                                           selectedCompanyId,
                                           selectedShopId,
                                           onWorkflowChange,
                                           className,
                                         }: WorkflowSelectorProps) {
  const [workflowType, setWorkflowType] = useState<"company" | "shop">(
      selectedShopId ? "shop" : "company"
  );

  // Use the shared shops hook
  const { shops, loading, error } = useShops(
      selectedCompanyId ? parseInt(selectedCompanyId) : undefined
  );

  // Reset to company workflow if no shops available
  useEffect(() => {
    if (shops.length === 0 && workflowType === "shop") {
      setWorkflowType("company");
      onWorkflowChange(selectedCompanyId);
    }
  }, [shops, workflowType, selectedCompanyId, onWorkflowChange]);

  const handleWorkflowTypeChange = (type: "company" | "shop") => {
    setWorkflowType(type);
    if (type === "company") {
      onWorkflowChange(selectedCompanyId);
    } else if (shops.length > 0) {
      // Select first shop by default
      const firstShopId = shops[0].id.toString();
      onWorkflowChange(selectedCompanyId, firstShopId);
    }
  };

  const handleShopChange = (shopId: string) => {
    onWorkflowChange(selectedCompanyId, shopId);
  };

  if (!selectedCompanyId) {
    return null;
  }

  const selectedShop = shops.find(s => s.id.toString() === selectedShopId);

  return (
      <Card className={cn("bg-white", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Workflow Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
              <div className="text-center text-muted-foreground py-4">
                Loading shops...
              </div>
          ) : error ? (
              <div className="text-center text-red-500 py-4">
                Error loading shops: {error}
              </div>
          ) : (
              <>
                <div className="flex gap-2">
                  <button
                      onClick={() => handleWorkflowTypeChange("company")}
                      className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                          workflowType === "company"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 hover:border-gray-300",
                      )}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Company-wide</span>
                    {workflowType === "company" && (
                        <Badge variant="secondary" className="ml-1">
                          Active
                        </Badge>
                    )}
                  </button>

                  <button
                      onClick={() => handleWorkflowTypeChange("shop")}
                      disabled={shops.length === 0}
                      className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                          workflowType === "shop"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 hover:border-gray-300",
                          shops.length === 0 && "opacity-50 cursor-not-allowed",
                      )}
                  >
                    <Store className="h-4 w-4" />
                    <span>Shop-specific</span>
                    {workflowType === "shop" && (
                        <Badge variant="secondary" className="ml-1">
                          Active
                        </Badge>
                    )}
                    {shops.length === 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                    (No shops)
                  </span>
                    )}
                  </button>
                </div>

                {workflowType === "shop" && shops.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Shop</label>
                      <Select
                          value={selectedShopId || shops[0]?.id.toString()}
                          onValueChange={handleShopChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a shop" />
                        </SelectTrigger>
                        <SelectContent>
                          {shops.map((shop) => (
                              <SelectItem key={shop.id} value={shop.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4" />
                                  <span>{shop.shopName}</span>
                                  {shop.locationId && (
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        Location {shop.locationId}
                                      </Badge>
                                  )}
                                </div>
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {workflowType === "company"
                      ? "Editing the default workflow template for all locations"
                      : `Editing workflow for ${selectedShop?.shopName || "selected shop"}`}
                </div>
              </>
          )}
        </CardContent>
      </Card>
  );
}