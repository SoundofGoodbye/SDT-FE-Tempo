"use client";

import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
  DrawerFooter, DrawerClose
} from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Euro, TrendingUp, Package, Calculator, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { DeliveryTabs } from "@/components/feature/DeliveryTabs";
import { DeliverySummaryCards } from "@/components/feature/delivery/DeliverySummaryCards";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import {
  calculateMetricsByUnit,
  calculateSnapshotFinancials,
  getItemValue,
  formatMetricValue,
  DisplayMode,
  DeliveryItem,
  FinancialMetrics,
  FinancialMetricsByUnit
} from "@/lib/utils/delivery-calculations";
import {
  FilterOptions,
  SortOptions,
  ViewMode,
  applyFilters,
  applySorting,
  generateInsights,
  hasProductChanged
} from "@/lib/utils/delivery-filters";
import {Button} from "@/components/ui/button";

interface DeliveryMatrixSnapshot {
  stepKey: string;
  stepName?: string;
  snapshotDate: string;
  note: string;
  items: DeliveryItem[];
}

export default function DeliveryMatrixPage() {
  useRequireAuth();
  const params = useParams();
  const shopId = params.shopId as string;
  const date = params.date as string;
  const companyId = "1";

  const [snapshots, setSnapshots] = useState<DeliveryMatrixSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("quantity");
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);
  const [showSummaryCards, setShowSummaryCards] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterOptions>({
    showOnlyChanged: false,
    minChangePercent: undefined,
    showProfitNegativeOnly: false,
    searchQuery: "",
    selectedProductIds: [],
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: "none",
    sortOrder: "asc",
  });

  const [viewMode, setViewMode] = useState<ViewMode>({
    type: "all-steps",
    selectedStep: 0,
    compareSteps: [0, 1],
  });

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        const response = await apiClient.get<ApiResponse<DeliveryMatrixSnapshot[]>>(
            `company/${companyId}/deliveries/matrix?shopId=${shopId}&date=${date}`
        );
        if (response?.payload) setSnapshots(response.payload);
        else setError("Invalid response format");
      } catch (e) {
        console.error("Matrix fetch error:", e);
        setError("Failed to load matrix data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrixData();
  }, [companyId, shopId, date]);

  const allItemIds = React.useMemo(() => {
    const ids = new Set<number>();
    snapshots.forEach(s => s.items.forEach(i => ids.add(i.itemId)));
    return Array.from(ids);
  }, [snapshots]);

  const itemsMap = React.useMemo(() => {
    const map = new Map<number, string>();
    snapshots.forEach(s => s.items.forEach(i => map.set(i.itemId, i.itemName)));
    return map;
  }, [snapshots]);

  // Calculate metrics using the utility function
  const metricsByUnit = React.useMemo(() => {
    if (snapshots.length < 2) return new Map<string, FinancialMetricsByUnit>();
    const [first, last] = [snapshots[0], snapshots[snapshots.length - 1]];
    return calculateMetricsByUnit(first.items, last.items, allItemIds, displayMode);
  }, [snapshots, allItemIds, displayMode]);

  // Apply filters and sorting
  const filteredItemIds = React.useMemo(() => {
    const filtered = applyFilters(
        allItemIds,
        snapshots,
        filters,
        itemsMap,
        displayMode
    );
    return applySorting(
        filtered,
        snapshots,
        sortOptions,
        itemsMap,
        displayMode
    );
  }, [allItemIds, snapshots, filters, sortOptions, itemsMap, displayMode]);

  // Generate insights
  const insights = React.useMemo(() =>
          generateInsights(snapshots, itemsMap, displayMode),
      [snapshots, itemsMap, displayMode]
  );

  // Get visible snapshots based on view mode
  const visibleSnapshots = React.useMemo(() => {
    switch (viewMode.type) {
      case "single-step":
        return viewMode.selectedStep !== undefined
            ? [snapshots[viewMode.selectedStep]].filter(Boolean)
            : snapshots;
      case "compare-steps":
        return viewMode.compareSteps
            ? [snapshots[viewMode.compareSteps[0]], snapshots[viewMode.compareSteps[1]]].filter(Boolean)
            : snapshots;
      case "timeline":
        return snapshots; // Timeline handles its own display
      default:
        return snapshots;
    }
  }, [snapshots, viewMode]);

  const getItemQuantity = (itemId: number, snap: DeliveryMatrixSnapshot) => {
    const item = snap.items.find(i => i.itemId === itemId);
    return item ? {
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice
    } : null;
  };

  const compareValues = (itemId: number, current: DeliveryMatrixSnapshot, idx: number, mode: DisplayMode) => {
    if (idx === 0) return null;
    const visibleSnaps = viewMode.type === "timeline" ? snapshots : visibleSnapshots;
    const prevIdx = viewMode.type === "compare-steps" ? 0 : idx - 1;

    const currItem = current.items.find(i => i.itemId === itemId);
    const prevItem = visibleSnaps[prevIdx]?.items.find(i => i.itemId === itemId);

    const currValue = getItemValue(currItem, mode);
    const prevValue = getItemValue(prevItem, mode);

    if (currValue === 0 && prevValue === 0) return null;
    return currValue > prevValue ? "increase" : currValue < prevValue ? "decrease" : "same";
  };

  const handleRowClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setDrawerOpen(true);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!snapshots.length) return <div className="p-6 text-muted">No data available.</div>;

  // Ensure we have valid data before rendering
  if (!itemsMap || !allItemIds) {
    return <div className="p-6 text-muted">Processing data...</div>;
  }

  return (
      <div className="container mx-auto py-6">
        <DeliveryTabs shopId={shopId} date={date} />
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Delivery Matrix – {date}</CardTitle>
                <p className="text-sm text-muted-foreground">Shop ID: {shopId}</p>
              </div>
              <ToggleGroup type="single" value={displayMode} onValueChange={(value) => value && setDisplayMode(value as DisplayMode)}>
                <ToggleGroupItem value="quantity" aria-label="Show quantities">
                  <Package className="h-4 w-4 mr-2" />
                  Quantity
                </ToggleGroupItem>
                <ToggleGroupItem value="cost" aria-label="Show costs">
                  <Euro className="h-4 w-4 mr-2" />
                  Cost
                </ToggleGroupItem>
                <ToggleGroupItem value="revenue" aria-label="Show revenue">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Revenue
                </ToggleGroupItem>
                <ToggleGroupItem value="profit" aria-label="Show profit">
                  <Calculator className="h-4 w-4 mr-2" />
                  Profit
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            {/* Financial Summary Bar */}
            {showFinancialSummary && (
                <Card className="mb-6 bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {snapshots.map((snap, idx) => {
                        const metrics = calculateSnapshotFinancials(snap.items);
                        return (
                            <div key={idx} className="text-center">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                {snap.note || snap.stepName || snap.stepKey}
                              </h4>
                              <div className="space-y-1">
                                <p className="text-sm">Cost: <span className="font-semibold">€{metrics.totalCost.toFixed(2)}</span></p>
                                <p className="text-sm">Revenue: <span className="font-semibold text-green-600">€{metrics.totalRevenue.toFixed(2)}</span></p>
                                <p className="text-sm">Profit: <span className={`font-semibold ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{metrics.totalProfit.toFixed(2)}
                            </span></p>
                                <p className="text-xs text-muted-foreground">Margin: {metrics.profitMargin.toFixed(1)}%</p>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Summary Metrics</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSummaryCards(!showSummaryCards)}
                    className="h-8 px-2"
                >
                  {showSummaryCards ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showSummaryCards && (
                  <DeliverySummaryCards metricsByUnit={metricsByUnit} displayMode={displayMode} />
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <label className="flex gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    checked={filters.showOnlyChanged}
                    onChange={e => setFilters({...filters, showOnlyChanged: e.target.checked})}
                />
                Show only changed products
              </label>
              <label className="flex gap-2 text-sm font-medium">
                <input type="checkbox" checked={showFinancialSummary} onChange={e => setShowFinancialSummary(e.target.checked)} />
                Show financial summary
              </label>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Product</TableHead>
                    {snapshots.map((snap, i) => (
                        <TableHead key={i} className="text-center">
                          {snap.note ? (
                              <TooltipProvider><Tooltip><TooltipTrigger>{snap.note} 📎</TooltipTrigger><TooltipContent>{snap.note}</TooltipContent></Tooltip></TooltipProvider>
                          ) : snap.stepName || snap.stepKey}
                        </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItemIds.map((id, rowIdx) => (
                      <TableRow key={id} onClick={() => handleRowClick(id)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>{rowIdx + 1}</TableCell>
                        <TableCell>{itemsMap.get(id)}</TableCell>
                        {snapshots.map((snap, i) => {
                          const item = snap.items.find(it => it.itemId === id);
                          const value = getItemValue(item, displayMode);
                          const cmp = compareValues(id, snap, i, displayMode);
                          return (
                              <TableCell key={i} className="text-center">
                                {value !== 0 ? (
                                    <div className="flex items-center justify-center">
                                      {formatMetricValue(value, displayMode, item?.unit)}
                                      {cmp && cmp !== "same" && (
                                          <Badge className={`ml-2 ${cmp === "increase" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} variant="outline">
                                            {cmp === "increase" ? "🟢" : "🔴"}
                                          </Badge>
                                      )}
                                    </div>
                                ) : "-"}
                              </TableCell>
                          );
                        })}
                      </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                    {visibleSnapshots.map((snap, i) => {
                      const metrics = calculateSnapshotFinancials(snap.items);
                      let footerValue = "";
                      switch (displayMode) {
                        case "quantity":
                          // Group by unit type for quantity display
                          const unitGroups = new Map<string, number>();
                          snap.items.forEach(item => {
                            const current = unitGroups.get(item.unit) || 0;
                            unitGroups.set(item.unit, current + item.quantity);
                          });
                          footerValue = Array.from(unitGroups.entries())
                              .map(([unit, total]) => `${total.toFixed(2)} ${unit}`)
                              .join(', ');
                          break;
                        case "cost":
                          footerValue = `€${metrics.totalCost.toFixed(2)}`;
                          break;
                        case "revenue":
                          footerValue = `€${metrics.totalRevenue.toFixed(2)}`;
                          break;
                        case "profit":
                          footerValue = `€${metrics.totalProfit.toFixed(2)}`;
                          break;
                      }
                      return (
                          <TableCell key={i} className="text-center font-semibold">
                            {footerValue}
                          </TableCell>
                      );
                    })}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Drawer with Financial Details */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[80vh] p-4 sm:p-6">
            <DrawerHeader>
              <DrawerTitle>
                {selectedItemId ? itemsMap.get(selectedItemId) || `Item ${selectedItemId}` : 'Product Details'}
              </DrawerTitle>
              <DrawerDescription>Per-phase history with financial details</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {selectedItemId && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshots.map((snap, idx) => {
                        const item = snap.items.find(i => i.itemId === selectedItemId);
                        if (!item) {
                          return (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{snap.note || snap.stepName || snap.stepKey}</TableCell>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">-</TableCell>
                              </TableRow>
                          );
                        }

                        const totalCost = (item.unitPrice || 0) * item.quantity;
                        const totalRevenue = (item.sellingPrice || 0) * item.quantity;
                        const profit = totalRevenue - totalCost;

                        return (
                            <TableRow key={idx}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>{snap.note || snap.stepName || snap.stepKey}</TableCell>
                              <TableCell className="text-right">
                                {item.quantity} {item.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.unitPrice ? `€${item.unitPrice.toFixed(3)}` : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.unitPrice ? `€${totalCost.toFixed(2)}` : '-'}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {item.sellingPrice ? `€${totalRevenue.toFixed(2)}` : '-'}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.unitPrice && item.sellingPrice ? `€${profit.toFixed(2)}` : '-'}
                              </TableCell>
                            </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Close</button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
  );
}