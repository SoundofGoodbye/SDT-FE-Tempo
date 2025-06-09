"use client";

import { useState, useMemo } from "react";
import {
  Product,
  ProductFilters,
  ProductSortOption,
  ProductFormData,
  ProductStats,
} from "@/types/product";

// Mock data for manager's company products
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
    code: "ACM-003",
    name: "Premium Bubble Wrap",
    category: "Protection",
    price: 18.75,
    companyId: "1",
    companyName: "Acme Logistics",
    shops: ["2"],
    shopNames: ["Airport Branch"],
    status: "Pending",
    lastUpdated: "2024-01-06T11:30:00Z",
    updatedBy: "Sarah Manager",
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-06T11:30:00Z",
  },
  {
    id: "4",
    code: "ACM-004",
    name: "Tracking Labels",
    category: "Supplies",
    price: 7.25,
    companyId: "1",
    companyName: "Acme Logistics",
    shops: ["1", "2"],
    shopNames: ["Downtown Hub", "Airport Branch"],
    status: "Active",
    lastUpdated: "2024-01-08T10:15:00Z",
    updatedBy: "Mike Johnson",
    createdAt: "2023-08-22T14:40:00Z",
    updatedAt: "2024-01-08T10:15:00Z",
  },
  {
    id: "5",
    code: "ACM-005",
    name: "Insulated Pouch",
    category: "Specialized",
    price: 22.5,
    companyId: "1",
    companyName: "Acme Logistics",
    shops: [],
    shopNames: [],
    status: "Inactive",
    lastUpdated: "2023-12-15T16:20:00Z",
    updatedBy: "Sarah Manager",
    createdAt: "2023-11-10T12:30:00Z",
    updatedAt: "2023-12-15T16:20:00Z",
  },
];

export function useMyCompanyProducts() {
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

  // Get company info from localStorage
  const assignedCompanyId =
    typeof window !== "undefined"
      ? localStorage.getItem("assignedCompanyId")
      : null;
  const companyName = "Acme Logistics"; // This would come from the company data

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.code.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesShop =
        filters.shop === "all" || product.shops.includes(filters.shop);
      const matchesStatus =
        filters.status === "all" || product.status === filters.status;

      return matchesSearch && matchesCategory && matchesShop && matchesStatus;
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
      companyId: assignedCompanyId || "1",
      companyName,
      shopNames: getShopNames(productData.shops),
      lastUpdated: new Date().toISOString(),
      updatedBy: "Manager",
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
              shopNames: getShopNames(productData.shops),
              lastUpdated: new Date().toISOString(),
              updatedBy: "Manager",
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        code: `${product.code}-COPY`,
        name: `${product.name} (Copy)`,
        shops: [],
        shopNames: [],
        status: "Pending",
        lastUpdated: new Date().toISOString(),
        updatedBy: "Manager",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const activateInShop = (productId: string, shopId: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newShops = [...product.shops];
          if (!newShops.includes(shopId)) {
            newShops.push(shopId);
          }
          return {
            ...product,
            shops: newShops,
            shopNames: getShopNames(newShops),
            status: "Active" as const,
            lastUpdated: new Date().toISOString(),
            updatedBy: "Manager",
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      }),
    );
  };

  const deactivateProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: "Inactive" as const,
              lastUpdated: new Date().toISOString(),
              updatedBy: "Manager",
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
    );
  };

  const getShopNames = (shopIds: string[]): string[] => {
    const shopNames: { [key: string]: string } = {
      "1": "Downtown Hub",
      "2": "Airport Branch",
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
    const totalItems = products.length;
    const activeInShops = products.filter(
      (p) => p.status === "Active" && p.shops.length > 0,
    ).length;
    const pendingActivation = products.filter(
      (p) => p.status === "Pending",
    ).length;

    // Get the most recent update
    const lastUpdate = products.reduce((latest, product) => {
      const productDate = new Date(product.lastUpdated);
      return productDate > latest ? productDate : latest;
    }, new Date(0));

    return {
      totalItems,
      lastUpdate: lastUpdate.toISOString(),
      activeInShops,
      pendingActivation,
    };
  }, [products]);

  const getUniqueCategories = () => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  };

  const getAvailableShops = () => {
    // This would come from the company's shops data
    return [
      { id: "1", name: "Downtown Hub" },
      { id: "2", name: "Airport Branch" },
    ];
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
    companyName,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    activateInShop,
    deactivateProduct,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedProducts.length,
    getUniqueCategories,
    getAvailableShops,
  };
}
