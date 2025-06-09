// delivery-system/packages/types/src/frontend.types.ts

// Core domain types that can be shared across all frontend applications
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

export interface Shop {
    id: string;
    name: string;
    address: string;
    status: "Active" | "Inactive";
    companyId: string;
    createdAt: string;
    updatedAt: string;
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