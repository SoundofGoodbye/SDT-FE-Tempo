//delivery-system/apps/admin-panel/src/hooks/useShopList.ts
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { shopService } from "@delivery-system/api-client";
import type { ShopExtended } from "@delivery-system/types";
import {
  Shop,
  ShopFilters,
  ShopSortOption,
  ShopFormData,
} from "@/types/company";

// Helper to convert BE ShopExtended to FE Shop type
const mapToFEShop = (beShop: ShopExtended, companyId: string): Shop => ({
  id: beShop.id.toString(),
  name: beShop.shopName,
  address: beShop.address || `Location ${beShop.locationId}`, // Using locationId as fallback
  status: beShop.status || 'Active',
  companyId: companyId,
  createdAt: beShop.createdAt || new Date().toISOString(),
  updatedAt: beShop.updatedAt || new Date().toISOString(),
});

export function useShopList(companyId: string) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ShopFilters>({
    search: "",
    status: "all",
  });
  const [sortOption, setSortOption] = useState<ShopSortOption>({
    field: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch shops from API
  const fetchShops = useCallback(async () => {
    if (!companyId) {
      setShops([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const beShops = await shopService.getAllShopsByCompany(
          parseInt(companyId),
          {
            // BE doesn't support these yet, but sending for future compatibility
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search !== "" ? filters.search : undefined,
            sortField: sortOption.field,
            sortDirection: sortOption.direction,
            status: filters.status !== "all" ? filters.status : undefined,
          }
      );

      const mappedShops = beShops.map(shop => mapToFEShop(shop, companyId));
      setShops(mappedShops);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
      setError('Failed to load shops');
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, currentPage, filters, sortOption]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Client-side filtering and sorting (until BE supports it)
  const filteredAndSortedShops = useMemo(() => {
    let filtered = shops.filter((shop) => {
      const matchesSearch =
          shop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          shop.address.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus =
          filters.status === "all" || shop.status === filters.status;

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      }

      return sortOption.direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [shops, filters, sortOption]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage);
  const paginatedShops = filteredAndSortedShops.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
  );

  const addShop = async (shopData: ShopFormData) => {
    try {
      // Note: We need a locationId here, which the FE doesn't have
      // This is a gap that needs BE/FE alignment
      await shopService.createShop(parseInt(companyId), {
        shopName: shopData.name,
        locationId: 1, // Default location - this needs proper handling
      });

      // Refresh the list
      await fetchShops();
    } catch (err) {
      console.error('Failed to create shop:', err);
      throw err;
    }
  };

  const updateShop = async (id: string, shopData: ShopFormData) => {
    try {
      await shopService.updateShop(
          parseInt(companyId),
          parseInt(id),
          {
            shopName: shopData.name,
            // locationId could be updated here if we had it
          }
      );

      // Refresh the list
      await fetchShops();
    } catch (err) {
      console.error('Failed to update shop:', err);
      throw err;
    }
  };

  const deleteShop = async (id: string) => {
    try {
      await shopService.deleteShop(parseInt(companyId), parseInt(id));

      // Refresh the list
      await fetchShops();
    } catch (err) {
      console.error('Failed to delete shop:', err);
      throw err;
    }
  };

  const getShopById = (id: string) => {
    return shops.find((shop) => shop.id === id);
  };

  const updateFilters = (newFilters: Partial<ShopFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateSort = (newSort: ShopSortOption) => {
    setSortOption(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const stats = useMemo(() => {
    const total = shops.length;
    const active = shops.filter((s) => s.status === "Active").length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }, [shops]);

  return {
    shops: paginatedShops,
    allShops: shops,
    filters,
    sortOption,
    currentPage,
    totalPages,
    itemsPerPage,
    stats,
    loading,
    error,
    addShop,
    updateShop,
    deleteShop,
    getShopById,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedShops.length,
    refetch: fetchShops,
  };
}