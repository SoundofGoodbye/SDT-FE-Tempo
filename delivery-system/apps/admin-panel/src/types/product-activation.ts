export interface ProductActivation {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  price: number;
  activeShops: string[];
  activeShopNames: string[];
  totalShops: number;
  isNewlyImported: boolean;
  lastModified: string;
  status: "Partial" | "Full" | "None";
}

export interface ActivationHistoryEntry {
  id: string;
  date: string;
  productId: string;
  productCode: string;
  productName: string;
  action: "Activated" | "Deactivated" | "Assigned to shops";
  shopNames: string[];
  performedBy: string;
}

export interface ShopActivationData {
  productId: string;
  shopIds: string[];
}
