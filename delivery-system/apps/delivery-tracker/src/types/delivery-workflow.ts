export interface WorkflowStep {
    id: number;
    stepKey: string;
    customName: string;
    order: number;
    metaJson: string | null;
}

export interface ProductListVersion {
    versionId: number;
    deliveryStepName: string;
    deliveryStepKey: string;
    workflowStepOrder: number;
    workflowStepId: number;
    productListDetailsNumber: string;
    productListDetailsId: number;
    stepDescription: string;
    companyId: number;
}

export interface ProductListItem {
    id: number;
    shopName: string;
    itemId: number;
    quantity: number;
    unit: string;
    productListDetailsId: number;
    itemName: string;
    unitPrice: number;
    sellingPrice: number;
}

// Response types for API calls
export interface WorkflowStepsResponse {
    message: string;
    count: number;
    payload: WorkflowStep[];
}

export interface ProductListVersionsResponse {
    message: string;
    count: number;
    payload: ProductListVersion[];
}

export interface ProductListItemsResponse {
    message: string;
    count: number;
    payload: ProductListItem[];
}

// Derived types for UI usage
export interface ProductItem {
    id: string;
    productName: string;
    qtyOrdered: number;
    qtyActual: number;
    notes: string;
    unitPrice: number;
    sellingPrice: number;
}

// Mapping functions
export function mapProductListItemToProductItem(item: ProductListItem): ProductItem {
    return {
        id: item.id.toString(),
        productName: item.itemName,
        qtyOrdered: item.quantity,
        qtyActual: item.quantity, // Using same value as we don't have separate actual qty in API
        notes: item.unit, // Using unit as notes for now
        unitPrice: item.unitPrice,
        sellingPrice: item.sellingPrice
    };
}