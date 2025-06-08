"use client";

import { useState, useMemo } from "react";
import { ProductActivation } from "@/types/product-activation";
import { useShopList } from "@/hooks/useShopList";

export function useProductActivationList(companyId: string) {
  const { allShops } = useShopList(companyId);

  // Mock data for products needing activation
  const mockActivationProducts: ProductActivation[] = useMemo(
    () => [
      {
        id: "1",
        productId: "1",
        productCode: "ACM-001",
        productName: "Standard Shipping Box",
        category: "Packaging",
        price: 12.99,
        activeShops: ["1"],
        activeShopNames: ["Downtown Hub"],
        totalShops: 2,
        isNewlyImported: false,
        lastModified: "2024-01-08T14:20:00Z",
        status: "Partial",
      },
      {
        id: "3",
        productId: "3",
        productCode: "ACM-003",
        productName: "Premium Bubble Wrap",
        category: "Protection",
        price: 18.75,
        activeShops: [],
        activeShopNames: [],
        totalShops: 2,
        isNewlyImported: true,
        lastModified: "2024-01-06T11:30:00Z",
        status: "None",
      },
      {
        id: "6",
        productId: "6",
        productCode: "ACM-006",
        productName: "Express Tape Roll",
        category: "Supplies",
        price: 5.99,
        activeShops: ["2"],
        activeShopNames: ["Airport Branch"],
        totalShops: 2,
        isNewlyImported: true,
        lastModified: "2024-01-09T09:15:00Z",
        status: "Partial",
      },
      {
        id: "7",
        productId: "7",
        productCode: "ACM-007",
        productName: "Fragile Stickers Pack",
        category: "Supplies",
        price: 3.25,
        activeShops: [],
        activeShopNames: [],
        totalShops: 2,
        isNewlyImported: false,
        lastModified: "2024-01-08T16:30:00Z",
        status: "None",
      },
    ],
    [],
  );

  const [products, setProducts] = useState<ProductActivation[]>(
    mockActivationProducts,
  );

  const activateInShops = (productId: string, shopIds: string[]) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.productId === productId) {
          const newActiveShops = [
            ...new Set([...product.activeShops, ...shopIds]),
          ];
          const newActiveShopNames = newActiveShops.map(
            (shopId) =>
              allShops.find((shop) => shop.id === shopId)?.name ||
              "Unknown Shop",
          );

          let status: "Partial" | "Full" | "None" = "None";
          if (newActiveShops.length === product.totalShops) {
            status = "Full";
          } else if (newActiveShops.length > 0) {
            status = "Partial";
          }

          return {
            ...product,
            activeShops: newActiveShops,
            activeShopNames: newActiveShopNames,
            status,
            lastModified: new Date().toISOString(),
          };
        }
        return product;
      }),
    );
  };

  const activateInAllShops = (productId: string) => {
    const allShopIds = allShops.map((shop) => shop.id);
    activateInShops(productId, allShopIds);
  };

  const deactivateFromShops = (productId: string, shopIds: string[]) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.productId === productId) {
          const newActiveShops = product.activeShops.filter(
            (shopId) => !shopIds.includes(shopId),
          );
          const newActiveShopNames = newActiveShops.map(
            (shopId) =>
              allShops.find((shop) => shop.id === shopId)?.name ||
              "Unknown Shop",
          );

          let status: "Partial" | "Full" | "None" = "None";
          if (newActiveShops.length === product.totalShops) {
            status = "Full";
          } else if (newActiveShops.length > 0) {
            status = "Partial";
          }

          return {
            ...product,
            activeShops: newActiveShops,
            activeShopNames: newActiveShopNames,
            status,
            lastModified: new Date().toISOString(),
          };
        }
        return product;
      }),
    );
  };

  const filteredProducts = useMemo(() => {
    // Only show products that are not active in all shops
    return products.filter((product) => product.status !== "Full");
  }, [products]);

  return {
    products: filteredProducts,
    allProducts: products,
    activateInShops,
    activateInAllShops,
    deactivateFromShops,
  };
}
