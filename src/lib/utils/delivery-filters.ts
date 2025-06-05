import { DeliveryItem, DisplayMode, getItemValue } from "./delivery-calculations";

export interface FilterOptions {
    showOnlyChanged: boolean;
    minChangePercent?: number;
    showProfitNegativeOnly: boolean;
    searchQuery: string;
    selectedProductIds: number[];
}

export interface SortOptions {
    sortBy: "none" | "name" | "change-amount" | "change-percent";
    sortOrder: "asc" | "desc";
}

export interface ViewMode {
    type: "all-steps" | "single-step" | "compare-steps" | "timeline";
    selectedStep?: number;
    compareSteps?: [number, number];
}

/**
 * Check if a product has changed between snapshots
 */
export function hasProductChanged(
    itemId: number,
    snapshots: { items: DeliveryItem[] }[]
): boolean {
    const quantities = snapshots
        .map(s => s.items.find(i => i.itemId === itemId)?.quantity ?? null)
        .filter(q => q !== null);
    return quantities.length > 1 && !quantities.every(q => q === quantities[0]);
}

/**
 * Calculate change percentage for an item
 */
export function calculateChangePercent(
    itemId: number,
    firstSnapshot: DeliveryItem[],
    lastSnapshot: DeliveryItem[],
    mode: DisplayMode = "quantity"
): number {
    const firstItem = firstSnapshot.find(i => i.itemId === itemId);
    const lastItem = lastSnapshot.find(i => i.itemId === itemId);

    const firstValue = getItemValue(firstItem, mode);
    const lastValue = getItemValue(lastItem, mode);

    if (firstValue === 0) return lastValue > 0 ? 100 : 0;
    return ((lastValue - firstValue) / firstValue) * 100;
}

/**
 * Check if item is profit negative
 */
export function isProfitNegative(item: DeliveryItem | undefined): boolean {
    if (!item || !item.unitPrice || !item.sellingPrice) return false;
    return item.sellingPrice < item.unitPrice;
}

/**
 * Apply filters to item IDs
 */
export function applyFilters(
    allItemIds: number[],
    snapshots: { items: DeliveryItem[] }[],
    filters: FilterOptions,
    itemsMap: Map<number, string>,
    displayMode: DisplayMode
): number[] {
    if (snapshots.length < 2) return allItemIds;

    const [first, last] = [snapshots[0], snapshots[snapshots.length - 1]];

    return allItemIds.filter(id => {
        // Search filter
        if (filters.searchQuery) {
            const itemName = itemsMap.get(id)?.toLowerCase() || "";
            if (!itemName.includes(filters.searchQuery.toLowerCase())) {
                return false;
            }
        }

        // Selected products filter
        if (filters.selectedProductIds.length > 0) {
            if (!filters.selectedProductIds.includes(id)) {
                return false;
            }
        }

        // Changed products filter
        if (filters.showOnlyChanged) {
            if (!hasProductChanged(id, snapshots)) {
                return false;
            }
        }

        // Minimum change percentage filter
        if (filters.minChangePercent !== undefined && filters.minChangePercent > 0) {
            const changePercent = Math.abs(
                calculateChangePercent(id, first.items, last.items, displayMode)
            );
            if (changePercent < filters.minChangePercent) {
                return false;
            }
        }

        // Profit negative filter
        if (filters.showProfitNegativeOnly) {
            const lastItem = last.items.find(i => i.itemId === id);
            if (!isProfitNegative(lastItem)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Sort item IDs based on sort options
 */
export function applySorting(
    itemIds: number[],
    snapshots: { items: DeliveryItem[] }[],
    sortOptions: SortOptions,
    itemsMap: Map<number, string>,
    displayMode: DisplayMode
): number[] {
    if (sortOptions.sortBy === "none" || snapshots.length < 2) {
        return itemIds;
    }

    const [first, last] = [snapshots[0], snapshots[snapshots.length - 1]];

    const sorted = [...itemIds].sort((a, b) => {
        let comparison = 0;

        switch (sortOptions.sortBy) {
            case "name":
                const nameA = itemsMap.get(a) || "";
                const nameB = itemsMap.get(b) || "";
                comparison = nameA.localeCompare(nameB);
                break;

            case "change-amount":
                const firstA = first.items.find(i => i.itemId === a);
                const lastA = last.items.find(i => i.itemId === a);
                const firstB = first.items.find(i => i.itemId === b);
                const lastB = last.items.find(i => i.itemId === b);

                const changeA = getItemValue(lastA, displayMode) - getItemValue(firstA, displayMode);
                const changeB = getItemValue(lastB, displayMode) - getItemValue(firstB, displayMode);
                comparison = changeA - changeB;
                break;

            case "change-percent":
                const percentA = calculateChangePercent(a, first.items, last.items, displayMode);
                const percentB = calculateChangePercent(b, first.items, last.items, displayMode);
                comparison = percentA - percentB;
                break;
        }

        return sortOptions.sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
}

/**
 * Generate automatic insights from the data
 */
export interface DeliveryInsight {
    type: "increase" | "decrease" | "new" | "removed" | "profit-warning";
    message: string;
    itemId?: number;
    value?: number;
}

export function generateInsights(
    snapshots: { items: DeliveryItem[] }[],
    itemsMap: Map<number, string>,
    displayMode: DisplayMode
): DeliveryInsight[] {
    if (snapshots.length < 2) return [];

    const insights: DeliveryInsight[] = [];
    const [first, last] = [snapshots[0], snapshots[snapshots.length - 1]];

    // Find biggest changes
    let biggestIncrease = { id: 0, percent: 0, name: "" };
    let biggestDecrease = { id: 0, percent: -100, name: "" };

    // Check each item
    const allIds = new Set<number>();
    [...first.items, ...last.items].forEach(item => allIds.add(item.itemId));

    allIds.forEach(id => {
        const firstItem = first.items.find(i => i.itemId === id);
        const lastItem = last.items.find(i => i.itemId === id);
        const name = itemsMap.get(id) || `Item ${id}`;

        // New items
        if (!firstItem && lastItem) {
            insights.push({
                type: "new",
                message: `New product added: ${name}`,
                itemId: id,
                value: lastItem.quantity
            });
        }

        // Removed items
        if (firstItem && !lastItem) {
            insights.push({
                type: "removed",
                message: `Product removed: ${name}`,
                itemId: id,
                value: firstItem.quantity
            });
        }

        // Track biggest changes
        if (firstItem && lastItem) {
            const changePercent = calculateChangePercent(id, first.items, last.items, displayMode);

            if (changePercent > biggestIncrease.percent) {
                biggestIncrease = { id, percent: changePercent, name };
            }
            if (changePercent < biggestDecrease.percent) {
                biggestDecrease = { id, percent: changePercent, name };
            }

            // Profit warnings
            if (displayMode === "profit" && isProfitNegative(lastItem)) {
                insights.push({
                    type: "profit-warning",
                    message: `${name} is selling below cost`,
                    itemId: id,
                    value: (lastItem.sellingPrice || 0) - (lastItem.unitPrice || 0)
                });
            }
        }
    });

    // Add biggest change insights
    if (biggestIncrease.percent > 20) {
        insights.unshift({
            type: "increase",
            message: `Biggest increase: ${biggestIncrease.name} (+${biggestIncrease.percent.toFixed(0)}%)`,
            itemId: biggestIncrease.id,
            value: biggestIncrease.percent
        });
    }

    if (biggestDecrease.percent < -20) {
        insights.unshift({
            type: "decrease",
            message: `Biggest decrease: ${biggestDecrease.name} (${biggestDecrease.percent.toFixed(0)}%)`,
            itemId: biggestDecrease.id,
            value: biggestDecrease.percent
        });
    }

    return insights.slice(0, 5); // Return top 5 insights
}