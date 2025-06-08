"use client";

import { useState, useMemo } from "react";
import {
  Product,
  ProductFilters,
  ProductSortOption,
  ProductFormData,
  ProductStats,
} from "@/types/product";

// Mock data for all company products (Admin view)
const mockProducts: Product[] = [
  {
    id: "1",
    code: "ACM-001",
    name: "Standard Shipping Box",
    category: "Packaging",
    price: 12.99,
    companyId: "1",
    companyName: "Acme Logistics",
    shops: ["1", "2"],
    shopNames: ["Downtown Hub", "Airport Branch"],
    status: "Active",
    lastUpdated: "2024-01-08T14:20:00Z",
    updatedBy: "Sarah Manager",
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2024-01-08T14:20:00Z",
  },
  {
    id: "2",
    code: "ACM-002",
    name: "Express Envelope",
    category: "Packaging",
    price: 3.5,
    companyId: "1",
    companyName: "Acme Logistics",
    shops: ["1"],
    shopNames: ["Downtown Hub"],
    status: "Active",
    lastUpdated: "2024-01-07T16:45:00Z",
    updatedBy: "Mike Johnson",
    createdAt: "2023-07-20T11:15:00Z",
    updatedAt: "2024-01-07T16:45:00Z",
  },
  {
    id: "3",
    code: "GSC-001",
    name: "Heavy Duty Container",
    category: "Storage",
    price: 45.0,
    companyId: "2",
    companyName: "Global Shipping Co",
    shops: ["3", "4"],
    shopNames: ["Port Terminal", "Warehouse A"],
    status: "Active",
    lastUpdated: "2024-01-08T09:20:00Z",
    updatedBy: "David Wilson",
    createdAt: "2023-08-10T14:20:00Z",
    updatedAt: "2024-01-08T09:20:00Z",
  },
  {
    id: "4",
    code: "GSC-002",
    name: "Fragile Item Wrap",
    category: "Protection",
    price: 8.75,
    companyId: "2",
    companyName: "Global Shipping Co",
    shops: ["3"],
    shopNames: ["Port Terminal"],
    status: "Pending",
    lastUpdated: "2024-01-06T12:30:00Z",
    updatedBy: "Emma Davis",
    createdAt: "2023-09-05T16:40:00Z",
    updatedAt: "2024-01-06T12:30:00Z",
  },
  {
    id: "5",
    code: "FTD-001",
    name: "Quick Delivery Bag",
    category: "Packaging",
    price: 6.25,
    companyId: "3",
    companyName: "FastTrack Delivery",
    shops: ["5"],
    shopNames: ["Central Station"],
    status: "Active",
    lastUpdated: "2024-01-08T08:15:00Z",
    updatedBy: "Robert Brown",
    createdAt: "2023-10-12T09:25:00Z",
    updatedAt: "2024-01-08T08:15:00Z",
  },
  {
    id: "6",
    code: "MTR-001",
    name: "Temperature Control Pack",
    category: "Specialized",
    price: 28.5,
    companyId: "4",
    companyName: "Metro Transport",
    shops: ["6", "7"],
    shopNames: ["North Hub", "South Hub"],
    status: "Active",
    lastUpdated: "2024-01-07T15:40:00Z",
    updatedBy: "Jennifer Taylor",
    createdAt: "2023-11-18T13:10:00Z",
    updatedAt: "2024-01-07T15:40:00Z",
  },
  {
    id: "7",
    code: "MTR-002",
    name: "Standard Label Set",
    category: "Supplies",
    price: 4.99,
    companyId: "4",
    companyName: "Metro Transport",
    shops: ["6"],
    shopNames: ["North Hub"],
    status: "Inactive",
    lastUpdated: "2023-12-20T14:30:00Z",
    updatedBy: "Alex Rodriguez",
    createdAt: "2023-12-01T11:45:00Z",
    updatedAt: "2023-12-20T14:30:00Z",
  },
  {
    id: "8",
    code: "CFR-001",
    name: "Waterproof Seal",
    category: "Protection",
    price: 15.75,
    companyId: "5",
    companyName: "Coastal Freight",
    shops: ["8"],
    shopNames: ["Harbor Point"],
    status: "Active",
    lastUpdated: "2024-01-05T10:20:00Z",
    updatedBy: "Maria Garcia",
    createdAt: "2023-12-15T15:30:00Z",
    updatedAt: "2024-01-05T10:20:00Z",
  },
];

export function useAllCompanyProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    company: "all",
    shop: "all",
    status: "all",
  });
  const [sortOption, setSortOption] = useState<ProductSortOption>({
    field: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.companyName
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesCompany =
        filters.company === "all" || product.companyId === filters.company;
      const matchesShop =
        filters.shop === "all" || product.shops.includes(filters.shop);
      const matchesStatus =
        filters.status === "all" || product.status === filters.status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCompany &&
        matchesShop &&
        matchesStatus
      );
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      }

      return sortOption.direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [products, filters, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const addProduct = (productData: ProductFormData) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      companyName: getCompanyName(productData.companyId || ""),
      shopNames: getShopNames(productData.shops),
      lastUpdated: new Date().toISOString(),
      updatedBy: "Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, productData: ProductFormData) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...productData,
              companyName: getCompanyName(productData.companyId || ""),
              shopNames: getShopNames(productData.shops),
              lastUpdated: new Date().toISOString(),
              updatedBy: "Admin",
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const copyToCompany = (productId: string, targetCompanyId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        companyId: targetCompanyId,
        companyName: getCompanyName(targetCompanyId),
        shops: [],
        shopNames: [],
        status: "Pending",
        lastUpdated: new Date().toISOString(),
        updatedBy: "Admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const getCompanyName = (companyId: string): string => {
    const companyNames: { [key: string]: string } = {
      "1": "Acme Logistics",
      "2": "Global Shipping Co",
      "3": "FastTrack Delivery",
      "4": "Metro Transport",
      "5": "Coastal Freight",
    };
    return companyNames[companyId] || "Unknown Company";
  };

  const getShopNames = (shopIds: string[]): string[] => {
    const shopNames: { [key: string]: string } = {
      "1": "Downtown Hub",
      "2": "Airport Branch",
      "3": "Port Terminal",
      "4": "Warehouse A",
      "5": "Central Station",
      "6": "North Hub",
      "7": "South Hub",
      "8": "Harbor Point",
    };
    return shopIds.map((id) => shopNames[id] || "Unknown Shop");
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const updateSort = (newSort: ProductSortOption) => {
    setSortOption(newSort);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const stats: ProductStats = useMemo(() => {
    const uniqueCompanies = new Set(products.map((p) => p.companyId)).size;
    const totalItems = products.length;
    const avgPerCompany =
      uniqueCompanies > 0 ? totalItems / uniqueCompanies : 0;

    // Calculate updates in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const updatesPerDay = products.filter(
      (p) => new Date(p.lastUpdated) > yesterday,
    ).length;

    return {
      totalItems,
      companies: uniqueCompanies,
      avgPerCompany: Math.round(avgPerCompany * 10) / 10,
      updatesPerDay,
    };
  }, [products]);

  const getUniqueCategories = () => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  };

  const getUniqueCompanies = () => {
    const companies = Array.from(
      new Set(products.map((p) => ({ id: p.companyId, name: p.companyName }))),
    );
    return companies.sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    products: paginatedProducts,
    allProducts: products,
    filters,
    sortOption,
    currentPage,
    totalPages,
    itemsPerPage,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    copyToCompany,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedProducts.length,
    getUniqueCategories,
    getUniqueCompanies,
  };
}
