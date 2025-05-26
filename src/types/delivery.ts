export interface ProductListItemModel {
    id: number;
    name?: string;
    itemName?: string;
    quantity: number;
    unit?: string;
    productListDetailsId?: number;

    // Add any additional fields that might be in the API response
    [key: string]: any;
}

export type StepName = "INITIAL_REQUEST" | "ON_BOARDING" | "OFF_LOADING" | "FINAL";

export interface VersionModel {
    versionId: number;
    deliveryStepName: StepName;
    productListDetailsId: number;

    // Add any additional fields that might be in the API response
    [key: string]: any;
}

export interface ProductListVersionModel {
    versionId: number;
    deliveryStepName: StepName;
    productListDetailsId: number;
    timestamp?: string;

    // Add any additional fields that might be in the API response
    [key: string]: any;
}

export interface ProductListDetailsProps {
    shopId?: number;
    shopName?: string;
    productListId?: number;
    date?: string;
    companyId?: number;
}

// Used for minimal version comparison and diffs
export interface ProductItemSummary {
    productId: string;
    name: string;
    quantity: number;
    notes: string | null;
}

// Used in order/actual product lists (more detailed screens)
export interface ProductItem {
    id: string;
    productName: string;
    qtyOrdered: number;
    qtyActual: number;
    notes: string;
    price: number;
}

// Used for version lists and selection
export interface Version {
    id: string;
    stepType: string;
    timestamp: string;
    productListDetailsId: string;
    stepDescription: string | null;
}

export interface DiffItem {
    productId: string;
    name: string;
    qtyA: number | null;
    qtyB: number | null;
    delta: number;
    notesA: string | null;
    notesB: string | null;
}