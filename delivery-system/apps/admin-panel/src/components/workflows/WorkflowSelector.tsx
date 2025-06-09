"use client";

import { useState, useEffect } from "react";
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

// Mock shop data
const mockShops = [
  { id: "shop-1", name: "Downtown Store", companyId: "company-1" },
  { id: "shop-2", name: "Mall Location", companyId: "company-1" },
  { id: "shop-3", name: "Airport Branch", companyId: "company-1" },
];

export default function WorkflowSelector({
  selectedCompanyId,
  selectedShopId,
  onWorkflowChange,
  className,
}: WorkflowSelectorProps) {
  const [workflowType, setWorkflowType] = useState<"company" | "shop">(
    "company",
  );
  const [availableShops, setAvailableShops] = useState(mockShops);

  useEffect(() => {
    // Filter shops by selected company
    const filteredShops = mockShops.filter(
      (shop) => shop.companyId === selectedCompanyId,
    );
    setAvailableShops(filteredShops);

    // Reset to company workflow if no shops available
    if (filteredShops.length === 0 && workflowType === "shop") {
      setWorkflowType("company");
      onWorkflowChange(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const handleWorkflowTypeChange = (type: "company" | "shop") => {
    setWorkflowType(type);
    if (type === "company") {
      onWorkflowChange(selectedCompanyId);
    } else if (availableShops.length > 0) {
      onWorkflowChange(selectedCompanyId, availableShops[0].id);
    }
  };

  const handleShopChange = (shopId: string) => {
    onWorkflowChange(selectedCompanyId, shopId);
  };

  if (!selectedCompanyId) {
    return null;
  }

  return (
    <Card className={cn("bg-white", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Workflow Scope
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            disabled={availableShops.length === 0}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
              workflowType === "shop"
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 hover:border-gray-300",
              availableShops.length === 0 && "opacity-50 cursor-not-allowed",
            )}
          >
            <Store className="h-4 w-4" />
            <span>Shop-specific</span>
            {workflowType === "shop" && (
              <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            )}
          </button>
        </div>

        {workflowType === "shop" && availableShops.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Shop</label>
            <Select
              value={selectedShopId || availableShops[0]?.id}
              onValueChange={handleShopChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a shop" />
              </SelectTrigger>
              <SelectContent>
                {availableShops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {shop.name}
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
            : `Editing workflow for ${availableShops.find((s) => s.id === selectedShopId)?.name || "selected shop"}`}
        </div>
      </CardContent>
    </Card>
  );
}
