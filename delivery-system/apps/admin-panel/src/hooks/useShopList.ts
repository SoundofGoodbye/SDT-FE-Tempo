"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Shop,
  ShopFilters,
  ShopSortOption,
  ShopFormData,
} from "@/types/company";

// Mock data - moved outside the hook to prevent redefinition on every call
const mockShops: Shop[] = [
  {
    id: "1",
    name: "Downtown Store",
    address: "123 Main St, New York, NY 10001",
    status: "Active",
    companyId: "1",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2024-01-08T14:20:00Z",
  },
  {
    id: "2",
    name: "Mall Location",
    address: "456 Shopping Center, New York, NY 10002",
    status: "Active",
    companyId: "1",
    createdAt: "2023-02-20T11:15:00Z",
    updatedAt: "2024-01-07T16:30:00Z",
  },
  {
    id: "3",
    name: "Airport Branch",
    address: "789 Airport Rd, New York, NY 10003",
    status: "Inactive",
    companyId: "1",
    createdAt: "2023-03-10T09:45:00Z",
    updatedAt: "2023-12-15T13:20:00Z",
  },
  {
    id: "4",
    name: "West Side Shop",
    address: "321 West Ave, Los Angeles, CA 90210",
    status: "Active",
    companyId: "2",
    createdAt: "2023-04-05T14:20:00Z",
    updatedAt: "2024-01-06T10:15:00Z",
  },
  {
    id: "5",
    name: "Beach Store",
    address: "654 Beach Blvd, Los Angeles, CA 90211",
    status: "Active",
    companyId: "2",
    createdAt: "2023-05-12T16:30:00Z",
    updatedAt: "2024-01-05T12:45:00Z",
  },
];

export function useShopList(companyId: string) {
  const [shops, setShops] = useState<Shop[]>([]);

  // Filter shops based on companyId when it changes
  useEffect(() => {
    const filtered = mockShops.filter((shop) => shop.companyId === companyId);
    setShops(filtered);
  }, [companyId]);
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

  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage);
  const paginatedShops = filteredAndSortedShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const addShop = (shopData: ShopFormData) => {
    const newShop: Shop = {
      id: Date.now().toString(),
      ...shopData,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setShops((prev) => [newShop, ...prev]);
  };

  const updateShop = (id: string, shopData: ShopFormData) => {
    setShops((prev) =>
      prev.map((shop) =>
        shop.id === id
          ? { ...shop, ...shopData, updatedAt: new Date().toISOString() }
          : shop,
      ),
    );
  };

  const deleteShop = (id: string) => {
    setShops((prev) => prev.filter((shop) => shop.id !== id));
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
    addShop,
    updateShop,
    deleteShop,
    getShopById,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedShops.length,
  };
}
