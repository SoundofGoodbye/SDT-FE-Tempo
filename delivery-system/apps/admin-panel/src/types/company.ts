//delivery-system/apps/admin-panel/src/types/company.ts

// Re-export shared types for convenience
export type { Company, Shop, Account } from '@delivery-system/types';
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

// Shop related UI types
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

// Account related UI types
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