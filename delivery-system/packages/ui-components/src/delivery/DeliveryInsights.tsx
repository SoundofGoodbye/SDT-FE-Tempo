"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Badge } from "../ui";
import { Alert, AlertDescription } from "../ui";
import {
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    AlertTriangle,
    Lightbulb,
} from "lucide-react";
import { DeliveryInsight } from "@delivery-system/utils";
import {cn} from "@delivery-system/utils";

interface DeliveryInsightsProps {
    insights: DeliveryInsight[];
    onItemClick?: (itemId: number) => void;
}

export function DeliveryInsights({ insights, onItemClick }: DeliveryInsightsProps) {
    if (insights.length === 0) {
        return null;
    }

    const getIcon = (type: DeliveryInsight["type"]) => {
        switch (type) {
            case "increase":
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case "decrease":
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            case "new":
                return <Plus className="h-4 w-4 text-blue-600" />;
            case "removed":
                return <X className="h-4 w-4 text-orange-600" />;
            case "profit-warning":
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getVariant = (type: DeliveryInsight["type"]) => {
        switch (type) {
            case "increase":
                return "default";
            case "decrease":
                return "destructive";
            case "new":
                return "default";
            case "removed":
                return "secondary";
            case "profit-warning":
                return "outline";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {insights.map((insight, index) => (
                    <Alert
                        key={index}
                        className={cn(
                            "py-2 px-3 transition-colors hover:bg-muted/50",
                            insight.itemId ? "cursor-pointer" : ""
                        )}
                        onClick={() => insight.itemId && onItemClick?.(insight.itemId)}
                    >
                        <div className="flex items-start gap-2">
                            {getIcon(insight.type)}
                            <AlertDescription className="text-sm">
                                {insight.message}
                                {insight.value !== undefined && insight.type === "profit-warning" && (
                                    <Badge variant={getVariant(insight.type)} className="ml-2">
                                        €{Math.abs(insight.value).toFixed(2)}
                                    </Badge>
                                )}
                            </AlertDescription>
                        </div>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
}