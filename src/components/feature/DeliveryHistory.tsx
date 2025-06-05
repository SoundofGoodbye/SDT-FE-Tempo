"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Upload, FileSpreadsheet } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import { ProductListImportModal } from "./ProductListImportModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DeliveryHistoryProps {
  companyId?: string;
}

interface HistoryRecord {
  date: string;
  shopId: string;
  versionCount: number;
  lastStepName: string;
}

interface ShopInfo {
  id: number;
  shopName: string;
  locationId: number;
  companyId: number;
}

export default function DeliveryHistory({
                                          companyId = "1",
                                        }: DeliveryHistoryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [shopInfoMap, setShopInfoMap] = useState<Record<string, ShopInfo>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [allShops, setAllShops] = useState<ShopInfo[]>([]);

  // Fetch all shops for the import modal
  const fetchAllShops = async () => {
    try {
      const response = await apiClient.get<ApiResponse<ShopInfo[]>>(`company/${companyId}/shop`);
      setAllShops(response.payload || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  // Fetch shop information
  const fetchShopInfo = async (shopId: string): Promise<ShopInfo | null> => {
    try {
      return await apiClient.get<ShopInfo>(
          `company/${companyId}/shop/${shopId}`
      );
    } catch (error) {
      console.error(`Failed to fetch shop info for shop ${shopId}:`, error);
      return null;
    }
  };

  // Fetch history data on mount
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<HistoryRecord[]>>(`company/${companyId}/productList/history`);

      setHistoryRecords(response.payload);

      // Fetch shop information for each unique shopId
      const uniqueShopIds: string[] = Array.from(
          new Set(response.payload.map(r => r.shopId.toString())));
      const shopInfoPromises = uniqueShopIds.map(shopId => fetchShopInfo(shopId));
      const shopInfoResults = await Promise.all(shopInfoPromises);

      // Create a map of shopId to shopInfo
      const shopMap: Record<string, ShopInfo> = {};
      uniqueShopIds.forEach((shopId, index) => {
        const shopInfo = shopInfoResults[index];
        if (shopInfo) {
          shopMap[shopId] = shopInfo;
        }
      });
      setShopInfoMap(shopMap);
    } catch (error) {
      console.error("Failed to fetch history data:", error);
      setHistoryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
    fetchAllShops();
  }, [companyId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleImportSuccess = () => {
    // Refresh the history data
    fetchHistoryData();
    setShowImportModal(false);
    setSelectedShopId(null);
  };

  const handleImportClick = (shopId?: number) => {
    setSelectedShopId(shopId || null);
    setShowImportModal(true);
  };

  return (
      <div className="bg-background w-full p-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Delivery History
              </CardTitle>
              <Button
                  onClick={() => handleImportClick()}
                  variant="outline"
                  className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Deliveries
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Icons.spinner className="h-8 w-8 animate-spin" />
                </div>
            ) : historyRecords.length === 0 ? (
                <div className="text-center py-16">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No deliveries found.</p>
                  <Button onClick={() => handleImportClick()}>
                    Import Your First Delivery
                  </Button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Shop Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Versions</TableHead>
                        <TableHead className="hidden sm:table-cell">Last Step</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyRecords.map((record, index) => (
                          <TableRow key={record.date + record.shopId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{shopInfoMap[record.shopId]?.shopName || record.shopId}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary">{record.versionCount}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{record.lastStepName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.push(`/shops/${record.shopId}/deliveries/${record.date}/versions`)
                                    }
                                >
                                  View Details
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.push(`/shops/${record.shopId}/deliveries/${record.date}/compare`)
                                    }
                                >
                                  Compare
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Import Modal */}
        {showImportModal && (
            <ShopSelectionModal
                isOpen={showImportModal}
                onClose={() => {
                  setShowImportModal(false);
                  setSelectedShopId(null);
                }}
                shops={allShops}
                companyId={parseInt(companyId)}
                onImportSuccess={handleImportSuccess}
            />
        )}
      </div>
  );
}

// Shop Selection Modal - wraps the import modal
interface ShopSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: ShopInfo[];
  companyId: number;
  onImportSuccess: () => void;
}

const ShopSelectionModal: React.FC<ShopSelectionModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 shops,
                                                                 companyId,
                                                                 onImportSuccess
                                                               }) => {
  const [selectedShop, setSelectedShop] = useState<ShopInfo | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleShopSelect = (shop: ShopInfo) => {
    setSelectedShop(shop);
    setShowImportModal(true);
  };

  if (showImportModal && selectedShop) {
    return (
        <ProductListImportModal
            isOpen={showImportModal}
            onClose={() => {
              setShowImportModal(false);
              setSelectedShop(null);
              onClose();
            }}
            companyId={companyId}
            shopId={selectedShop.id}
            onImportSuccess={onImportSuccess}
        />
    );
  }

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Shop for Import</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {shops.map((shop) => (
                <Button
                    key={shop.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleShopSelect(shop)}
                >
                  {shop.shopName}
                </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
  );
};