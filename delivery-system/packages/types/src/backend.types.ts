//delivery-system/packages/types/src/backend.types.ts

// Base wrapper for BE responses
export interface BaseListWrapper<T> {
    values: T;
}

// Company types matching BE CompanyModel
export interface CompanyResponse {
    id: number;
    companyName: string;
}

// Shop types matching BE ShopModel
export interface ShopResponse {
    id: number;
    shopName: string;
    locationId: number;
    companyId: number;
}

// Extended types for FE (these fields need BE support)
export interface CompanyExtended extends CompanyResponse {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    shopsCount?: number;
    usersCount?: number;
    productsCount?: number;
    revenue?: number;
    plan?: "Pro" | "Basic";
    status?: "Active" | "Inactive" | "Suspended";
    createdAt?: string;
    updatedAt?: string;
}

export interface ShopExtended extends ShopResponse {
    address?: string;
    status?: "Active" | "Inactive";
    createdAt?: string;
    updatedAt?: string;
}

// Request types
export interface CompanyCreateRequest {
    companyName: string;
}

export interface CompanyUpdateRequest {
    companyName: string;
}

export interface ShopCreateRequest {
    shopName: string;
    locationId: number;
}

export interface ShopUpdateRequest {
    shopName?: string;
    locationId?: number;
}

// Query parameters for filtering/sorting/pagination
export interface ListQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    [key: string]: any; // For additional filters
}