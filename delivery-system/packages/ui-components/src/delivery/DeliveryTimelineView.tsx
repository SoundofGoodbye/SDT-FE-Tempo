// components/feature/delivery/DeliveryTimelineView.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { Badge } from "../ui";
import { Button } from "../ui";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui";
import { DeliveryItem, formatMetricValue, DisplayMode } from "@delivery-system/utils";

interface TimelineSnapshot {
    stepKey: string;
    stepName?: string;
    snapshotDate: string;
    note: string;
    items: DeliveryItem[];
}

interface DeliveryTimelineViewProps {
    snapshots: TimelineSnapshot[];
    displayMode: DisplayMode;
    onItemClick: (itemId: number) => void;
}

export function DeliveryTimelineView({
                                         snapshots,
                                         displayMode,
                                         onItemClick,
                                     }: DeliveryTimelineViewProps) {
    const [expandedSteps, setExpandedSteps] = React.useState<Set<number>>(
        new Set([0]) // First step expanded by default
    );

    const toggleStep = (index: number) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedSteps(newExpanded);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(parseInt(dateString));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStepSummary = (snapshot: TimelineSnapshot) => {
        const itemCount = snapshot.items.length;
        let totalValue = 0;

        snapshot.items.forEach(item => {
            switch (displayMode) {
                case "quantity":
                    totalValue += item.quantity;
                    break;
                case "cost":
                    totalValue += (item.unitPrice || 0) * item.quantity;
                    break;
                case "revenue":
                    totalValue += (item.sellingPrice || 0) * item.quantity;
                    break;
                case "profit":
                    totalValue += ((item.sellingPrice || 0) - (item.unitPrice || 0)) * item.quantity;
                    break;
            }
        });

        return { itemCount, totalValue };
    };

    return (
        <div className="space-y-0">
            {snapshots.map((snapshot, index) => {
                const isExpanded = expandedSteps.has(index);
                const summary = getStepSummary(snapshot);
                const isLast = index === snapshots.length - 1;

                return (
                    <div key={index} className="relative">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                        )}

                        <Collapsible open={isExpanded} onOpenChange={() => toggleStep(index)}>
                            <Card className="mb-4">
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Timeline dot */}
                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    index === 0 ? 'bg-primary text-primary-foreground' :
                                                        isLast ? 'bg-green-600 text-white' :
                                                            'bg-muted'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </div>

                                            {/* Step info */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {snapshot.note || snapshot.stepName || snapshot.stepKey}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDate(snapshot.snapshotDate)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm text-muted-foreground">
                                                                {summary.itemCount} items
                                                            </p>
                                                            <p className="font-semibold">
                                                                {formatMetricValue(summary.totalValue, displayMode)}
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {snapshot.items.map((item) => (
                                                <div
                                                    key={item.itemId}
                                                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                                                    onClick={() => onItemClick(item.itemId)}
                                                >
                                                    <p className="text-sm font-medium truncate">
                                                        {item.itemName}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit}
                            </span>
                                                        {displayMode !== "quantity" && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {formatMetricValue(
                                                                    displayMode === "cost" ? (item.unitPrice || 0) * item.quantity :
                                                                        displayMode === "revenue" ? (item.sellingPrice || 0) * item.quantity :
                                                                            ((item.sellingPrice || 0) - (item.unitPrice || 0)) * item.quantity,
                                                                    displayMode
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Step changes summary */}
                                        {index > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm text-muted-foreground">
                                                    Changes from previous step:
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {/* Calculate changes - simplified for now */}
                                                        Items: {snapshot.items.length - snapshots[index - 1].items.length}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    </div>
                );
            })}
        </div>
    );
}