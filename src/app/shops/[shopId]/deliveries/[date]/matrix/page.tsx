"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/lib/useRequireAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeliveryTabs } from "@/components/DeliveryTabs";
import apiClient, { ApiResponse } from "@/lib/api-client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

// Define interfaces for the API response
interface DeliveryMatrixItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
}

interface DeliveryMatrixSnapshot {
  stepName: StepName;
  snapshotDate: string;
  note: string;
  items: DeliveryMatrixItem[];
}

const checkpointOrder: StepName[] = [
  "INITIAL_REQUEST",
  "ON_BOARDING",
  "OFF_LOADING",
  "FINAL",
];

const stepLabels = {
  "INITIAL_REQUEST": "Request",
  "ON_BOARDING": "Onboarding",
  "OFF_LOADING": "Mid-Trip",
  "FINAL": "Delivered"
} as const;

type StepName = keyof typeof stepLabels;

export default function DeliveryMatrixPage() {
  // Use the auth hook to protect this page
  useRequireAuth();

  const params = useParams();
  const shopId = params.shopId as string;
  const date = params.date as string;
  const companyId = "1"; // Hardcoded as mentioned in requirements

  const [snapshots, setSnapshots] = useState<DeliveryMatrixSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch matrix data on mount
  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<ApiResponse<DeliveryMatrixSnapshot[]>>(
          `company/${companyId}/deliveries/matrix?shopId=${shopId}&date=${date}`
        );

        if (response && response.payload) {
          setSnapshots(response.payload);
        } else {
          setError("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching matrix data:", error);
        setError("Failed to load matrix data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatrixData();
  }, [companyId, shopId, date]);

  // Get all unique item IDs across all snapshots
  const allItemIds = React.useMemo(() => {
    const itemIds = new Set<number>();
    snapshots.forEach(snapshot => {
      snapshot.items.forEach(item => {
        itemIds.add(item.itemId);
      });
    });
    return Array.from(itemIds);
  }, [snapshots]);

  // Create a map of all items with their names
  const itemsMap = React.useMemo(() => {
    const map = new Map<number, string>();
    snapshots.forEach(snapshot => {
      snapshot.items.forEach(item => {
        map.set(item.itemId, item.itemName);
      });
    });
    return map;
  }, [snapshots]);

  // Sort snapshots by checkpoint order
  const sortedSnapshots = React.useMemo(() => {
    return [...snapshots].sort((a, b) => {
      const indexA = checkpointOrder.indexOf(a.stepName);
      const indexB = checkpointOrder.indexOf(b.stepName);
      return indexA - indexB;
    });
  }, [snapshots]);

  // Determine if a product has changed across phases
  const hasProductChanged = React.useCallback((itemId: number) => {
    if (sortedSnapshots.length <= 1) return false;

    // Get all quantities for this item across snapshots
    const quantities = sortedSnapshots.map(snapshot => {
      const item = snapshot.items.find(item => item.itemId === itemId);
      return item ? item.quantity : null;
    }).filter(q => q !== null);

    // If we have fewer than 2 quantities, we can't determine change
    if (quantities.length < 2) return false;

    // Check if all quantities are the same
    const firstQuantity = quantities[0];
    return !quantities.every(q => q === firstQuantity);
  }, [sortedSnapshots]);

  // Filter item IDs based on showOnlyChanged setting
  const filteredItemIds = React.useMemo(() => {
    if (!showOnlyChanged) return allItemIds;
    return allItemIds.filter(itemId => hasProductChanged(itemId));
  }, [allItemIds, hasProductChanged, showOnlyChanged]);

  // Get quantity for a specific item in a specific snapshot
  const getItemQuantity = (itemId: number, snapshot: DeliveryMatrixSnapshot) => {
    const item = snapshot.items.find(item => item.itemId === itemId);
    return item ? { quantity: item.quantity, unit: item.unit } : null;
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = React.useMemo(() => {
    if (sortedSnapshots.length < 2) {
      return {
        netChange: 0,
        totalAdded: 0,
        totalRemoved: 0
      };
    }

    // Get initial and final snapshots
    const initialSnapshot = sortedSnapshots[0];
    const finalSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

    // Calculate total quantities for initial and final snapshots
    const initialTotal = initialSnapshot.items.reduce((sum, item) => sum + item.quantity, 0);
    const finalTotal = finalSnapshot.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate net change
    const netChange = finalTotal - initialTotal;

    // Calculate total added and removed
    let totalAdded = 0;
    let totalRemoved = 0;

    // For each item, compare initial and final quantities
    allItemIds.forEach(itemId => {
      const initialItem = initialSnapshot.items.find(item => item.itemId === itemId);
      const finalItem = finalSnapshot.items.find(item => item.itemId === itemId);

      const initialQty = initialItem ? initialItem.quantity : 0;
      const finalQty = finalItem ? finalItem.quantity : 0;
      const delta = finalQty - initialQty;

      if (delta > 0) {
        totalAdded += delta;
      } else if (delta < 0) {
        totalRemoved += Math.abs(delta);
      }
    });

    return {
      netChange,
      totalAdded,
      totalRemoved
    };
  }, [sortedSnapshots, allItemIds]);

  // Handle row click to open drawer
  const handleRowClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setDrawerOpen(true);
  };

  // Compare quantities between current and previous snapshot
  const compareQuantities = (
    itemId: number,
    currentSnapshot: DeliveryMatrixSnapshot,
    snapshotIndex: number
  ) => {
    if (snapshotIndex === 0) return null; // No comparison for first snapshot

    const currentItem = getItemQuantity(itemId, currentSnapshot);
    if (!currentItem) return null;

    const previousSnapshot = sortedSnapshots[snapshotIndex - 1];
    const previousItem = getItemQuantity(itemId, previousSnapshot);
    if (!previousItem) return null;

    if (currentItem.quantity > previousItem.quantity) {
      return "increase";
    } else if (currentItem.quantity < previousItem.quantity) {
      return "decrease";
    }
    return "same";
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <DeliveryTabs shopId={shopId} date={date} />
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <DeliveryTabs shopId={shopId} date={date} />
        <Card>
          <CardHeader>
            <CardTitle>Delivery Matrix – {date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64 bg-red-50 text-red-500 rounded-md">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render empty state
  if (snapshots.length === 0 || allItemIds.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <DeliveryTabs shopId={shopId} date={date} />
        <Card>
          <CardHeader>
            <CardTitle>Delivery Matrix – {date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
              <p className="text-muted-foreground">No data available for this date.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <DeliveryTabs shopId={shopId} date={date} />
      <Card>
        <CardHeader>
          <CardTitle>Delivery Matrix – {date}</CardTitle>
          <p className="text-sm text-muted-foreground">Shop ID: {shopId}</p>
        </CardHeader>
        <CardContent>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Net Change</h3>
                  <p className={`text-2xl font-bold ${calculateSummaryMetrics.netChange > 0 ? 'text-green-600' : calculateSummaryMetrics.netChange < 0 ? 'text-red-600' : ''}`}>
                    {calculateSummaryMetrics.netChange > 0 ? '+' : ''}{calculateSummaryMetrics.netChange}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Added</h3>
                  <p className="text-2xl font-bold text-green-600">
                    +{calculateSummaryMetrics.totalAdded}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Removed/Broken</h3>
                  <p className="text-2xl font-bold text-red-600">
                    -{calculateSummaryMetrics.totalRemoved}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="showOnlyChanged"
              checked={showOnlyChanged}
              onChange={(e) => setShowOnlyChanged(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="showOnlyChanged" className="text-sm font-medium">
              Show only changed products
            </label>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Product</TableHead>
                  {sortedSnapshots.map((snapshot, index) => (
                    <TableHead key={snapshot.stepName} className="text-center">
                      {snapshot.note ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                {stepLabels[snapshot.stepName] || snapshot.stepName}
                                <span className="ml-1">📎</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{snapshot.note}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        stepLabels[snapshot.stepName] || snapshot.stepName
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItemIds.map(itemId => (
                  <TableRow 
                    key={itemId} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(itemId)}
                  >
                    <TableCell className="font-medium">
                      {itemsMap.get(itemId) || `Item ${itemId}`}
                    </TableCell>
                    {sortedSnapshots.map((snapshot, index) => {
                      const itemData = getItemQuantity(itemId, snapshot);
                      const comparison = compareQuantities(itemId, snapshot, index);

                      return (
                        <TableCell key={snapshot.stepName} className="text-center">
                          {itemData ? (
                            <div className="flex items-center justify-center">
                              <span>
                                {itemData.quantity} {itemData.unit}
                              </span>
                              {comparison && comparison !== "same" && (
                                <Badge 
                                  className={`ml-2 ${
                                    comparison === "increase" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-red-100 text-red-800"
                                  }`}
                                  variant="outline"
                                >
                                  {comparison === "increase" 
                                    ? "🟢" 
                                    : "🔴"}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>
              {selectedItemId ? itemsMap.get(selectedItemId) || `Item ${selectedItemId}` : 'Product Details'}
            </DrawerTitle>
            <DrawerDescription>
              Per-phase history for this product
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            {selectedItemId && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSnapshots.map((snapshot, index) => {
                    const itemData = getItemQuantity(selectedItemId, snapshot);
                    const comparison = index > 0 ? compareQuantities(selectedItemId, snapshot, index) : null;

                    return (
                      <TableRow key={snapshot.stepName}>
                        <TableCell className="font-medium">
                          {stepLabels[snapshot.stepName] || snapshot.stepName}
                        </TableCell>
                        <TableCell className="text-right">
                          {itemData ? (
                            <div className="flex items-center justify-end">
                              <span>
                                {itemData.quantity} {itemData.unit}
                              </span>
                              {comparison && comparison !== "same" && (
                                <Badge 
                                  className={`ml-2 ${
                                    comparison === "increase" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-red-100 text-red-800"
                                  }`}
                                  variant="outline"
                                >
                                  {comparison === "increase" 
                                    ? "🟢" 
                                    : "🔴"}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {snapshot.note || "-"}
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
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
