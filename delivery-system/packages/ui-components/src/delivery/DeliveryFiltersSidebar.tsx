// components/feature/delivery/DeliveryFiltersSidebar.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Label } from "../ui";
import { Input } from "../ui";
import { Slider } from "../ui";
import { Switch } from "../ui";
import { Button } from "../ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui";
import { Badge } from "../ui";
import { Check, Filter, RotateCcw } from "lucide-react";
import { ScrollArea } from "../ui";
import { FilterOptions, SortOptions, ViewMode } from '@delivery-system/utils';

interface DeliveryFiltersSidebarProps {
    filters: FilterOptions;
    sortOptions: SortOptions;
    viewMode: ViewMode;
    products: Map<number, string>;
    totalSteps: number;
    onFiltersChange: (filters: FilterOptions) => void;
    onSortChange: (sort: SortOptions) => void;
    onViewModeChange: (mode: ViewMode) => void;
}

export function DeliveryFiltersSidebar({
                                           filters,
                                           sortOptions,
                                           viewMode,
                                           products,
                                           totalSteps,
                                           onFiltersChange,
                                           onSortChange,
                                           onViewModeChange,
                                       }: DeliveryFiltersSidebarProps) {
    const productsList = Array.from(products.entries()).map(([id, name]) => ({
        value: id,
        label: name,
    }));

    const handleProductToggle = (productId: number) => {
        const newSelectedIds = filters.selectedProductIds.includes(productId)
            ? filters.selectedProductIds.filter(pid => pid !== productId)
            : [...filters.selectedProductIds, productId];

        onFiltersChange({ ...filters, selectedProductIds: newSelectedIds });
    };

    const handleReset = () => {
        onFiltersChange({
            showOnlyChanged: false,
            minChangePercent: undefined,
            showProfitNegativeOnly: false,
            searchQuery: "",
            selectedProductIds: [],
        });
        onSortChange({
            sortBy: "none",
            sortOrder: "asc",
        });
    };

    const stepOptions = Array.from({ length: totalSteps }, (_, i) => ({
        value: i.toString(),
        label: `Step ${i + 1}`,
    }));

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters & View
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8 px-2"
                    >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* View Mode Section */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">View Mode</Label>
                    <Select
                        value={viewMode.type}
                        onValueChange={(value: ViewMode["type"]) => {
                            onViewModeChange({ ...viewMode, type: value });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-steps">All Steps</SelectItem>
                            <SelectItem value="single-step">Single Step</SelectItem>
                            <SelectItem value="compare-steps">Compare 2 Steps</SelectItem>
                            <SelectItem value="timeline">Timeline View</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Single Step Selector */}
                    {viewMode.type === "single-step" && (
                        <Select
                            value={viewMode.selectedStep?.toString()}
                            onValueChange={(value) => {
                                onViewModeChange({
                                    ...viewMode,
                                    selectedStep: parseInt(value),
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select step" />
                            </SelectTrigger>
                            <SelectContent>
                                {stepOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Compare Steps Selectors */}
                    {viewMode.type === "compare-steps" && (
                        <div className="space-y-2">
                            <Select
                                value={viewMode.compareSteps?.[0]?.toString()}
                                onValueChange={(value) => {
                                    onViewModeChange({
                                        ...viewMode,
                                        compareSteps: [parseInt(value), viewMode.compareSteps?.[1] || 1],
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="First step" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stepOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={viewMode.compareSteps?.[1]?.toString()}
                                onValueChange={(value) => {
                                    onViewModeChange({
                                        ...viewMode,
                                        compareSteps: [viewMode.compareSteps?.[0] || 0, parseInt(value)],
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Second step" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stepOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm">Search Products</Label>
                    <Input
                        id="search"
                        placeholder="Type to search..."
                        value={filters.searchQuery}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, searchQuery: e.target.value })
                        }
                    />
                </div>

                {/* Product Multi-Select */}
                <div className="space-y-2">
                    <Label className="text-sm">Select Products</Label>
                    <div className="border rounded-md p-2">
                        <ScrollArea className="h-48 w-full">
                            <div className="space-y-2">
                                {productsList.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No products available
                                    </p>
                                ) : (
                                    productsList.map((product) => (
                                        <label
                                            key={product.value}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.selectedProductIds.includes(product.value)}
                                                onChange={() => handleProductToggle(product.value)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm truncate flex-1">
                        {product.label}
                      </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    {filters.selectedProductIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                                {filters.selectedProductIds.length} selected
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, selectedProductIds: [] })}
                                className="h-6 px-2 text-xs"
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                {/* Toggle Filters */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="only-changed" className="text-sm">
                            Show only changed
                        </Label>
                        <Switch
                            id="only-changed"
                            checked={filters.showOnlyChanged}
                            onCheckedChange={(checked) =>
                                onFiltersChange({ ...filters, showOnlyChanged: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="profit-negative" className="text-sm">
                            Profit negative only
                        </Label>
                        <Switch
                            id="profit-negative"
                            checked={filters.showProfitNegativeOnly}
                            onCheckedChange={(checked) =>
                                onFiltersChange({ ...filters, showProfitNegativeOnly: checked })
                            }
                        />
                    </div>
                </div>

                {/* Minimum Change Slider */}
                <div className="space-y-2">
                    <Label className="text-sm">
                        Minimum change: {filters.minChangePercent || 0}%
                    </Label>
                    <Slider
                        value={[filters.minChangePercent || 0]}
                        onValueChange={([value]) =>
                            onFiltersChange({ ...filters, minChangePercent: value })
                        }
                        max={100}
                        step={5}
                        className="w-full"
                    />
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Sort By</Label>
                    <Select
                        value={sortOptions.sortBy}
                        onValueChange={(value: SortOptions["sortBy"]) =>
                            onSortChange({ ...sortOptions, sortBy: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="name">Product Name</SelectItem>
                            <SelectItem value="change-amount">Change Amount</SelectItem>
                            <SelectItem value="change-percent">Change Percent</SelectItem>
                        </SelectContent>
                    </Select>

                    {sortOptions.sortBy !== "none" && (
                        <Select
                            value={sortOptions.sortOrder}
                            onValueChange={(value: SortOptions["sortOrder"]) =>
                                onSortChange({ ...sortOptions, sortOrder: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}