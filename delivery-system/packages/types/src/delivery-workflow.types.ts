// delivery-system/packages/types/src/delivery-workflow.types.ts
import { ProductItem } from './delivery.types';

// Core workflow types that match backend
export interface WorkflowStep {
    id: number;
    stepKey: string;
    customName: string;
    order: number;
    metaJson: string | null;
}

// UI-specific workflow step data (stored in metaJson)
export interface WorkflowStepMeta {
    color?: string;
    position?: { x: number; y: number };
    notifications?: {
        shopAssistant: boolean;
        customerSms: boolean;
    };
    stats?: {
        avgTime: number; // in minutes
        successRate: number; // percentage
    };
}

// Extended workflow step for UI usage
export interface WorkflowStepUI extends Omit<WorkflowStep, 'metaJson'> {
    meta: WorkflowStepMeta;
}

// Workflow connections for visual representation
export interface WorkflowConnection {
    id: string;
    fromStepId: number;
    toStepId: number;
    avgTransitionTime?: number; // in minutes
    isBottleneck?: boolean;
}

// Complete workflow structure
export interface Workflow {
    id: number;
    companyId: number;
    shopId?: number;
    name: string;
    steps: WorkflowStep[];
    connections?: WorkflowConnection[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// UI-enhanced workflow
export interface WorkflowUI extends Omit<Workflow, 'steps'> {
    steps: WorkflowStepUI[];
}

// Workflow statistics
export interface WorkflowStats {
    totalWorkflows: number;
    avgCompletionTime: number;
    successRate: number;
    bottlenecks: {
        stepId: number;
        stepName: string;
        avgDelay: number;
    }[];
}

// Product list related types (existing)
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

export interface WorkflowResponse {
    message: string;
    payload: Workflow;
}

export interface WorkflowsResponse {
    message: string;
    count: number;
    payload: Workflow[];
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

// Helper functions to convert between backend and UI representations
export function parseWorkflowStepMeta(metaJson: string | null): WorkflowStepMeta {
    if (!metaJson) {
        return {
            color: '#6366f1',
            position: { x: 0, y: 0 },
            notifications: { shopAssistant: false, customerSms: false },
            stats: { avgTime: 15, successRate: 95 }
        };
    }
    try {
        return JSON.parse(metaJson);
    } catch {
        return {};
    }
}

export function stringifyWorkflowStepMeta(meta: WorkflowStepMeta): string {
    return JSON.stringify(meta);
}

export function toWorkflowStepUI(step: WorkflowStep): WorkflowStepUI {
    return {
        ...step,
        meta: parseWorkflowStepMeta(step.metaJson)
    };
}

export function fromWorkflowStepUI(step: WorkflowStepUI): WorkflowStep {
    return {
        ...step,
        metaJson: stringifyWorkflowStepMeta(step.meta)
    };
}

export function toWorkflowUI(workflow: Workflow): WorkflowUI {
    return {
        ...workflow,
        steps: workflow.steps.map(toWorkflowStepUI)
    };
}

export function fromWorkflowUI(workflow: WorkflowUI): Workflow {
    return {
        ...workflow,
        steps: workflow.steps.map(fromWorkflowStepUI)
    };
}

// Existing mapping function
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