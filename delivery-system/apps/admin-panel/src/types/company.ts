//delivery-system/apps/admin-panel/src/types/company.ts
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  shopsCount: number;
  usersCount: number;
  productsCount: number;
  revenue: number;
  plan: "Pro" | "Basic";
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  plan: "Pro" | "Basic";
  status: "Active" | "Inactive" | "Suspended";
}

export interface CompanyFilters {
  search: string;
  plan: "all" | "Pro" | "Basic";
  status: "all" | "Active" | "Inactive" | "Suspended";
}

export interface CompanySortOption {
  field: "name" | "revenue" | "shopsCount" | "usersCount" | "createdAt";
  direction: "asc" | "desc";
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  status: "Active" | "Inactive";
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopFormData {
  name: string;
  address: string;
  status: "Active" | "Inactive";
}

export interface ShopFilters {
  search: string;
  status: "all" | "Active" | "Inactive";
}

export interface ShopSortOption {
  field: "name" | "address" | "status" | "createdAt";
  direction: "asc" | "desc";
}

export interface Account {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Shop Assistant" | "Delivery";
  status: "Active" | "Suspended";
  companyId?: string;
  companyName?: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountFormData {
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Shop Assistant" | "Delivery";
  status: "Active" | "Suspended";
  companyId?: string;
}

export interface AccountFilters {
  search: string;
  role: "all" | "Admin" | "Manager" | "Shop Assistant" | "Delivery";
  status: "all" | "Active" | "Suspended";
}

export interface AccountSortOption {
  field: "name" | "email" | "role" | "status" | "lastActive" | "createdAt";
  direction: "asc" | "desc";
}
