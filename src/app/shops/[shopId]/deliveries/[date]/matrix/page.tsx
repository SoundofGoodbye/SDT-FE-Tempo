// Refactored DeliveryMatrixPage.tsx (no hardcoded step names, dynamic snapshot-based labels)
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { DeliveryTabs } from "@/components/feature/DeliveryTabs";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
  DrawerFooter, DrawerClose
} from "@/components/ui/drawer";

interface DeliveryMatrixItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
}

interface DeliveryMatrixSnapshot {
  stepKey: string;
  snapshotDate: string;
  note: string;
  items: DeliveryMatrixItem[];
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
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const hasProductChanged = React.useCallback((itemId: number) => {
    const quantities = snapshots.map(s => s.items.find(i => i.itemId === itemId)?.quantity ?? null)
        .filter(q => q !== null);
    return quantities.length > 1 && !quantities.every(q => q === quantities[0]);
  }, [snapshots]);

  const filteredItemIds = React.useMemo(() =>
          showOnlyChanged ? allItemIds.filter(hasProductChanged) : allItemIds,
      [allItemIds, hasProductChanged, showOnlyChanged]
  );

  const getItemQuantity = (itemId: number, snap: DeliveryMatrixSnapshot) => {
    const item = snap.items.find(i => i.itemId === itemId);
    return item ? { quantity: item.quantity, unit: item.unit } : null;
  };

  const compareQuantities = (itemId: number, current: DeliveryMatrixSnapshot, idx: number) => {
    if (idx === 0) return null;
    const curr = getItemQuantity(itemId, current);
    const prev = getItemQuantity(itemId, snapshots[idx - 1]);
    if (!curr || !prev) return null;
    return curr.quantity > prev.quantity ? "increase" : curr.quantity < prev.quantity ? "decrease" : "same";
  };

  const calculateSummaryMetrics = React.useMemo(() => {
    if (snapshots.length < 2) return { netChange: 0, totalAdded: 0, totalRemoved: 0 };
    const [first, last] = [snapshots[0], snapshots[snapshots.length - 1]];
    let net = 0, add = 0, rem = 0;
    allItemIds.forEach(id => {
      const iQty = first.items.find(i => i.itemId === id)?.quantity || 0;
      const fQty = last.items.find(i => i.itemId === id)?.quantity || 0;
      const delta = fQty - iQty;
      net += delta;
      if (delta > 0) add += delta;
      else if (delta < 0) rem += Math.abs(delta);
    });
    return { netChange: net, totalAdded: add, totalRemoved: rem };
  }, [snapshots, allItemIds]);

  const handleRowClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setDrawerOpen(true);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!snapshots.length) return <div className="p-6 text-muted">No data available.</div>;

  return (
      <div className="container mx-auto py-6">
        <DeliveryTabs shopId={shopId} date={date} />
        <Card>
          <CardHeader>
            <CardTitle>Delivery Matrix – {date}</CardTitle>
            <p className="text-sm text-muted-foreground">Shop ID: {shopId}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["Net Change", "Total Added", "Total Removed/Broken"].map((label, i) => (
                  <Card key={i}><CardContent className="pt-6 text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">{label}</h3>
                    <p className={`text-2xl font-bold ${i === 1 ? 'text-green-600' : i === 2 ? 'text-red-600' : ''}`}>
                      {i === 0 ? calculateSummaryMetrics.netChange : i === 1 ? `+${calculateSummaryMetrics.totalAdded}` : `-${calculateSummaryMetrics.totalRemoved}`}
                    </p></CardContent></Card>
              ))}
            </div>

            <label className="flex gap-2 mb-4 text-sm font-medium">
              <input type="checkbox" checked={showOnlyChanged} onChange={e => setShowOnlyChanged(e.target.checked)} />
              Show only changed products
            </label>

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
                          ) : snap.stepKey}
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
                          const item = getItemQuantity(id, snap);
                          const cmp = compareQuantities(id, snap, i);
                          return (
                              <TableCell key={i} className="text-center">
                                {item ? (
                                    <div className="flex items-center justify-center">
                                      {item.quantity} {item.unit}
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
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[80vh] p-4 sm:p-6">
            <DrawerHeader>
              <DrawerTitle>
                {selectedItemId ? itemsMap.get(selectedItemId) || `Item ${selectedItemId}` : 'Product Details'}
              </DrawerTitle>
              <DrawerDescription>Per-phase history</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {selectedItemId && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshots.map((snap, idx) => {
                        const item = getItemQuantity(selectedItemId, snap);
                        const cmp = idx > 0 ? compareQuantities(selectedItemId, snap, idx) : null;
                        return (
                            <TableRow key={idx}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>{snap.note || snap.stepKey}</TableCell>
                              <TableCell className="text-right">
                                {item ? (
                                    <div className="flex items-center justify-end">
                                      {item.quantity} {item.unit}
                                      {cmp && cmp !== "same" && (
                                          <Badge className={`ml-2 ${cmp === "increase" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} variant="outline">
                                            {cmp === "increase" ? "🟢" : "🔴"}
                                          </Badge>
                                      )}
                                    </div>
                                ) : "-"}
                              </TableCell>
                              <TableCell>{snap.note || "-"}</TableCell>
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
