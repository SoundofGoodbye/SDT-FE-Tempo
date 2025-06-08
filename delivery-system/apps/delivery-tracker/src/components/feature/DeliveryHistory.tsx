"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@delivery-system/ui-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@delivery-system/ui-components";
import { Button } from "@delivery-system/ui-components";
import { CalendarIcon, Upload, FileSpreadsheet, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Icons } from "@delivery-system/ui-components";
import { apiClient, ApiResponse } from '@delivery-system/api-client';
import { ProductListImportModal } from "@delivery-system/ui-components";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@delivery-system/ui-components";
import { Badge } from "@delivery-system/ui-components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@delivery-system/ui-components";
import { Popover, PopoverContent, PopoverTrigger } from "@delivery-system/ui-components";
import { Calendar } from "@delivery-system/ui-components";
import { format, parse } from "date-fns";
import { Checkbox } from "@delivery-system/ui-components";
import { Label } from "@delivery-system/ui-components";
import {
  PagedDeliveryHistoryResponse,
  DeliveryHistoryFilters,
  LocationInfo
} from "@/types/delivery-history.types";

interface DeliveryHistoryProps {
  companyId?: string;
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
  const [historyResponse, setHistoryResponse] = useState<PagedDeliveryHistoryResponse | null>(null);
  const [shopInfoMap, setShopInfoMap] = useState<Record<string, ShopInfo>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [allShops, setAllShops] = useState<ShopInfo[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<DeliveryHistoryFilters>({
    page: 0,
    size: 20,
    sort: "date,desc",
    useDefaultDateRange: true,
  });

  // Fetch locations for filter dropdown
  const fetchLocations = async () => {
    try {
      const response = await apiClient.get<ApiResponse<LocationInfo[]>>(`/location`);
      setLocations(response.payload || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  // Fetch all shops for the import modal
  const fetchAllShops = async () => {
    try {
      const response = await apiClient.get<ApiResponse<ShopInfo[]>>(`company/${companyId}/shop`);
      setAllShops(response.payload || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  // Fetch shop information for display
  const fetchShopInfo = async (shopIds: string[]): Promise<Record<string, ShopInfo>> => {
    const shopMap: Record<string, ShopInfo> = {};

    const shopInfoPromises = shopIds.map(async (shopId) => {
      try {
        const shopInfo = await apiClient.get<ShopInfo>(
            `company/${companyId}/shop/${shopId}`
        );
        return { shopId, shopInfo };
      } catch (error) {
        console.error(`Failed to fetch shop info for shop ${shopId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(shopInfoPromises);
    results.forEach((result) => {
      if (result) {
        shopMap[result.shopId] = result.shopInfo;
      }
    });

    return shopMap;
  };

  // Fetch paginated history data
  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get<PagedDeliveryHistoryResponse>(
          `company/${companyId}/productList/history/paginated?${params.toString()}`
      );

      setHistoryResponse(response);

      // Fetch shop information for current page
      if (response.content.length > 0) {
        const uniqueShopIds = Array.from(
            new Set(response.content.map(r => r.shopId.toString()))
        );
        const shopMap = await fetchShopInfo(uniqueShopIds);
        setShopInfoMap(shopMap);
      }
    } catch (error) {
      console.error("Failed to fetch history data:", error);
      setHistoryResponse(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  useEffect(() => {
    fetchLocations();
    fetchAllShops();
  }, [companyId]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const formatDate = (dateString: string | number | null | undefined) => {
    // Add null/undefined check
    if (!dateString) {
      return 'N/A';
    }

    let date: Date;

    // Check if it's a number (timestamp)
    if (typeof dateString === 'number' || !isNaN(Number(dateString))) {
      date = new Date(Number(dateString));
    }
    // Check if the date is in dd.MM.yyyy format
    else if (typeof dateString === 'string' && dateString.includes('.')) {
      date = parse(dateString, 'dd.MM.yyyy', new Date());
    }
    // Otherwise assume it's a standard date string
    else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateForUrl = (dateValue: string | number) => {
    const date = new Date(Number(dateValue));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleImportSuccess = () => {
    fetchHistoryData();
    setShowImportModal(false);
    setSelectedShopId(null);
  };

  const handleImportClick = (shopId?: number) => {
    setSelectedShopId(shopId || null);
    setShowImportModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field: string) => {
    const currentSort = filters.sort?.split(',')[0];
    const currentDirection = filters.sort?.split(',')[1] || 'desc';
    const newDirection = currentSort === field && currentDirection === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({ ...prev, sort: `${field},${newDirection}` }));
  };

  const handleFilterChange = (key: keyof DeliveryHistoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 })); // Reset to first page on filter change
  };

  const clearDateFilters = () => {
    setFilters(prev => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      month: undefined,
      year: undefined,
      useDefaultDateRange: true,
      page: 0
    }));
  };

  const renderFilters = () => (
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(filters.shopIds?.length || filters.locationId || filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="ml-2">
                  {(filters.shopIds?.length || 0) + (filters.locationId ? 1 : 0) + (filters.dateFrom || filters.dateTo ? 1 : 0)}
                </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filters</h4>
            </div>

            {/* Shop Filter */}
            <div className="grid gap-2">
              <Label>Shops</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {allShops.map(shop => (
                    <div key={shop.id} className="flex items-center space-x-2">
                      <Checkbox
                          id={`shop-${shop.id}`}
                          checked={filters.shopIds?.includes(shop.id) || false}
                          onCheckedChange={(checked) => {
                            const currentShopIds = filters.shopIds || [];
                            const newShopIds = checked
                                ? [...currentShopIds, shop.id]
                                : currentShopIds.filter(id => id !== shop.id);
                            handleFilterChange('shopIds', newShopIds.length > 0 ? newShopIds : undefined);
                          }}
                      />
                      <Label
                          htmlFor={`shop-${shop.id}`}
                          className="text-sm font-normal cursor-pointer"
                      >
                        {shop.shopName}
                      </Label>
                    </div>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="grid gap-2">
              <Label>Location</Label>
              <Select
                  value={filters.locationId?.toString() || "all"}
                  onValueChange={(value) => handleFilterChange('locationId', value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.cityName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom || 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={filters.dateFrom ? parse(filters.dateFrom, 'dd.MM.yyyy', new Date()) : undefined}
                        onSelect={(date) => {
                          handleFilterChange('dateFrom', date ? format(date, 'dd.MM.yyyy') : undefined);
                          handleFilterChange('useDefaultDateRange', false);
                        }}
                        initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo || 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={filters.dateTo ? parse(filters.dateTo, 'dd.MM.yyyy', new Date()) : undefined}
                        onSelect={(date) => {
                          handleFilterChange('dateTo', date ? format(date, 'dd.MM.yyyy') : undefined);
                          handleFilterChange('useDefaultDateRange', false);
                        }}
                        initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Quick date options */}
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      handleFilterChange('month', now.getMonth() + 1);
                      handleFilterChange('year', now.getFullYear());
                      handleFilterChange('dateFrom', undefined);
                      handleFilterChange('dateTo', undefined);
                      handleFilterChange('useDefaultDateRange', false);
                    }}
                >
                  This Month
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                      handleFilterChange('month', lastMonth.getMonth() + 1);
                      handleFilterChange('year', lastMonth.getFullYear());
                      handleFilterChange('dateFrom', undefined);
                      handleFilterChange('dateTo', undefined);
                      handleFilterChange('useDefaultDateRange', false);
                    }}
                >
                  Last Month
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      page: 0,
                      size: 20,
                      sort: "date,desc",
                      useDefaultDateRange: true,
                    });
                  }}
                  className="flex-1"
              >
                Clear All
              </Button>
              <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
  );

  const renderPagination = () => {
    if (!historyResponse || historyResponse.totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {historyResponse.pageNumber * historyResponse.pageSize + 1} to{' '}
            {Math.min(
                (historyResponse.pageNumber + 1) * historyResponse.pageSize,
                historyResponse.totalElements
            )}{' '}
            of {historyResponse.totalElements} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(historyResponse.pageNumber - 1)}
                disabled={historyResponse.first}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {historyResponse.pageNumber + 1} of {historyResponse.totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(historyResponse.pageNumber + 1)}
                disabled={historyResponse.last}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
    );
  };

  const renderSummary = () => {
    if (!historyResponse?.summary) return null;

    const { summary } = historyResponse;
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.uniqueShops}</div>
              <p className="text-xs text-muted-foreground">Unique Shops</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.uniqueDays}</div>
              <p className="text-xs text-muted-foreground">Delivery Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">
                {summary.dateRangeStart ? formatDate(summary.dateRangeStart) : 'N/A'} -{' '}
                {summary.dateRangeEnd ? formatDate(summary.dateRangeEnd) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Date Range</p>
            </CardContent>
          </Card>
        </div>
    );
  };

  return (
      <div className="bg-background w-full p-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6" />
                  Delivery History
                </CardTitle>
                {renderFilters()}
              </div>
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
            {renderSummary()}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Icons.spinner className="h-8 w-8 animate-spin" />
                </div>
            ) : !historyResponse || historyResponse.content.length === 0 ? (
                <div className="text-center py-16">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No deliveries found for the selected criteria.</p>
                  <div className="space-y-2">
                    <Button onClick={() => handleImportClick()}>
                      Import Deliveries
                    </Button>
                    {(filters.shopIds?.length || filters.locationId || filters.dateFrom || filters.dateTo) && (
                        <Button variant="outline" onClick={clearDateFilters}>
                          Clear Filters
                        </Button>
                    )}
                  </div>
                </div>
            ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleSortChange('date')}
                          >
                            Date
                            {filters.sort?.startsWith('date') && (
                                <span className="ml-1">
                            {filters.sort.includes('desc') ? '↓' : '↑'}
                          </span>
                            )}
                          </TableHead>
                          <TableHead>Shop Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Versions</TableHead>
                          <TableHead className="hidden sm:table-cell">Last Step</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyResponse.content.map((record, index) => (
                            <TableRow key={`${record.date}-${record.shopId}`}>
                              <TableCell>
                                {historyResponse.pageNumber * historyResponse.pageSize + index + 1}
                              </TableCell>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{shopInfoMap[record.shopId]?.shopName || `Shop ${record.shopId}`}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant="secondary">{record.versionCount}</Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{record.lastStepName}</TableCell>
                              <TableCell>
                                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                  <Button
                                      size="sm"
                                      onClick={() =>
                                          router.push(`/shops/${record.shopId}/deliveries/${formatDateForUrl(record.date)}/versions`)
                                      }
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                          router.push(`/shops/${record.shopId}/deliveries/${formatDateForUrl(record.date)}/compare`)
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
                  {renderPagination()}
                </>
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