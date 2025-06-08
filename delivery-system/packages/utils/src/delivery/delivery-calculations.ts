export interface FinancialMetricsByUnit extends MetricsByUnit {
    netCostChange: number;
    netRevenueChange: number;
    netProfitChange: number;
}

export interface DeliveryItem {
    itemId: number;
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    sellingPrice?: number;
}

export interface MetricsByUnit {
    netChange: number;
    totalAdded: number;
    totalRemoved: number;
    unit: string;
}

/**
 * Calculate financial metrics for a snapshot
 */
export function calculateSnapshotFinancials(items: DeliveryItem[]): FinancialMetrics {
    let totalCost = 0;
    let totalRevenue = 0;

    items.forEach(item => {
        const cost = getItemValue(item, "cost");
        const revenue = getItemValue(item, "revenue");
        totalCost += cost;
        totalRevenue += revenue;
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { totalCost, totalRevenue, totalProfit, profitMargin };
}

export interface FinancialMetrics {
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
}

export type DisplayMode = "quantity" | "cost" | "revenue" | "profit";

/**
 * Calculate the value of an item based on the display mode
 */
export function getItemValue(item: DeliveryItem | undefined, mode: DisplayMode): number {
    if (!item) return 0;

    switch (mode) {
        case "quantity":
            return item.quantity;
        case "cost":
            return (item.unitPrice || 0) * item.quantity;
        case "revenue":
            return (item.sellingPrice || 0) * item.quantity;
        case "profit":
            return ((item.sellingPrice || 0) - (item.unitPrice || 0)) * item.quantity;
        default:
            return item.quantity;
    }
}

/**
 * Group items by unit type and calculate metrics
 */
export function calculateMetricsByUnit(
    firstSnapshot: DeliveryItem[],
    lastSnapshot: DeliveryItem[],
    allItemIds: number[],
    mode: DisplayMode = "quantity"
): Map<string, FinancialMetricsByUnit> {
    const metricsByUnit = new Map<string, FinancialMetricsByUnit>();

    allItemIds.forEach(id => {
        const firstItem = firstSnapshot.find(i => i.itemId === id);
        const lastItem = lastSnapshot.find(i => i.itemId === id);

        // Determine the unit (prefer from the item that exists)
        const unit = lastItem?.unit || firstItem?.unit || 'unknown';

        // Calculate values based on mode
        const initialValue = getItemValue(firstItem, mode);
        const finalValue = getItemValue(lastItem, mode);
        const delta = finalValue - initialValue;

        // Calculate financial metrics
        const initialCost = getItemValue(firstItem, "cost");
        const finalCost = getItemValue(lastItem, "cost");
        const costDelta = finalCost - initialCost;

        const initialRevenue = getItemValue(firstItem, "revenue");
        const finalRevenue = getItemValue(lastItem, "revenue");
        const revenueDelta = finalRevenue - initialRevenue;

        const initialProfit = getItemValue(firstItem, "profit");
        const finalProfit = getItemValue(lastItem, "profit");
        const profitDelta = finalProfit - initialProfit;

        if (!metricsByUnit.has(unit)) {
            metricsByUnit.set(unit, {
                netChange: 0,
                totalAdded: 0,
                totalRemoved: 0,
                netCostChange: 0,
                netRevenueChange: 0,
                netProfitChange: 0,
                unit
            });
        }

        const unitMetrics = metricsByUnit.get(unit)!;
        unitMetrics.netChange += delta;
        unitMetrics.netCostChange += costDelta;
        unitMetrics.netRevenueChange += revenueDelta;
        unitMetrics.netProfitChange += profitDelta;

        if (delta > 0) {
            unitMetrics.totalAdded += delta;
        } else if (delta < 0) {
            unitMetrics.totalRemoved += Math.abs(delta);
        }
    });

    return metricsByUnit;
}

/**
 * Format display value with appropriate currency or unit
 */
export function formatMetricValue(value: number, mode: DisplayMode, unit?: string): string {
    switch (mode) {
        case "cost":
        case "revenue":
        case "profit":
            return `€${Math.abs(value).toFixed(2)}`;
        case "quantity":
        default:
            return `${Math.abs(value).toFixed(2)} ${unit || ''}`.trim();
    }
}

/**
 * Get user-friendly label for unit type
 */
export function getUnitLabel(unit: string): string {
    const unitLabels: Record<string, string> = {
        'кг': 'Weight (kg)',
        'бр': 'Pieces',
        'л': 'Liters',
        'unknown': 'Unknown Unit'
    };
    return unitLabels[unit] || `Unit: ${unit}`;
}

/**
 * Get metric label based on display mode
 */
export function getMetricLabel(mode: DisplayMode): {
    netChange: string;
    totalAdded: string;
    totalRemoved: string;
} {
    switch (mode) {
        case "cost":
            return {
                netChange: "Net Cost Change",
                totalAdded: "Cost Increase",
                totalRemoved: "Cost Decrease"
            };
        case "revenue":
            return {
                netChange: "Net Revenue Change",
                totalAdded: "Revenue Increase",
                totalRemoved: "Revenue Decrease"
            };
        case "profit":
            return {
                netChange: "Net Profit Change",
                totalAdded: "Profit Increase",
                totalRemoved: "Profit Loss"
            };
        case "quantity":
        default:
            return {
                netChange: "Net Change",
                totalAdded: "Total Added",
                totalRemoved: "Total Removed"
            };
    }
}