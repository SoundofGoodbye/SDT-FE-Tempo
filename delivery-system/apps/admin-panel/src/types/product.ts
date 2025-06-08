export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  companyId: string;
  companyName: string;
  shops: string[];
  shopNames: string[];
  status: "Active" | "Inactive" | "Pending";
  lastUpdated: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  code: string;
  name: string;
  category: string;
  price: number;
  companyId?: string;
  shops: string[];
  status: "Active" | "Inactive" | "Pending";
}

export interface ProductFilters {
  search: string;
  category: "all" | string;
  company: "all" | string;
  shop: "all" | string;
  status: "all" | "Active" | "Inactive" | "Pending";
}

export interface ProductSortOption {
  field: "code" | "name" | "category" | "price" | "companyName" | "lastUpdated";
  direction: "asc" | "desc";
}

export interface ProductStats {
  totalItems: number;
  companies?: number;
  avgPerCompany?: number;
  updatesPerDay?: number;
  lastUpdate?: string;
  activeInShops?: number;
  pendingActivation?: number;
}
