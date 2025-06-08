"use client";

import React from "react";
import { Card, CardContent } from "../ui";
import {
    DisplayMode,
    FinancialMetricsByUnit,
    formatMetricValue,
    getUnitLabel,
    getMetricLabel
} from "@delivery-system/utils";

interface DeliverySummaryCardsProps {
    metricsByUnit: Map<string, FinancialMetricsByUnit>;
    displayMode: DisplayMode;
}

export function DeliverySummaryCards({ metricsByUnit, displayMode }: DeliverySummaryCardsProps) {
    const labels = getMetricLabel(displayMode);

    // For financial modes, aggregate all units
    const showAggregated = displayMode !== "quantity";

    if (showAggregated) {
        // Aggregate all financial metrics
        let totalNetChange = 0;
        let totalAdded = 0;
        let totalRemoved = 0;

        metricsByUnit.forEach((metrics) => {
            totalNetChange += metrics.netChange;
            totalAdded += metrics.totalAdded;
            totalRemoved += metrics.totalRemoved;
        });

        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    label={labels.netChange}
                    value={totalNetChange}
                    mode={displayMode}
                    variant="neutral"
                />
                <MetricCard
                    label={labels.totalAdded}
                    value={totalAdded}
                    mode={displayMode}
                    variant="positive"
                />
                <MetricCard
                    label={labels.totalRemoved}
                    value={totalRemoved}
                    mode={displayMode}
                    variant="negative"
                />
            </div>
        );
    }

    // For quantity mode, show by unit type
    return (
        <div className="space-y-4 mb-6">
            {Array.from(metricsByUnit.entries()).map(([unit, metrics]) => (
                <div key={unit} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{getUnitLabel(unit)}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MetricCard
                            label={labels.netChange}
                            value={metrics.netChange}
                            mode={displayMode}
                            unit={unit}
                            variant="neutral"
                        />
                        <MetricCard
                            label={labels.totalAdded}
                            value={metrics.totalAdded}
                            mode={displayMode}
                            unit={unit}
                            variant="positive"
                        />
                        <MetricCard
                            label={labels.totalRemoved}
                            value={metrics.totalRemoved}
                            mode={displayMode}
                            unit={unit}
                            variant="negative"
                        />
                    </div>
                </div>
            ))}

            {/* Overall Summary for multiple unit types */}
            {metricsByUnit.size > 1 && <OverallSummaryCard metricsByUnit={metricsByUnit} />}
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: number;
    mode: DisplayMode;
    unit?: string;
    variant: "neutral" | "positive" | "negative";
}

function MetricCard({ label, value, mode, unit, variant }: MetricCardProps) {
    const formattedValue = formatMetricValue(value, mode, unit);
    const showSign = variant !== "negative" && value !== 0;

    const colorClass = {
        neutral: value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '',
        positive: 'text-green-600',
        negative: 'text-red-600'
    }[variant];

    return (
        <Card>
            <CardContent className="pt-6 text-center">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{label}</h4>
                <p className={`text-2xl font-bold ${colorClass}`}>
                    {showSign && value > 0 ? '+' : variant === "negative" ? '-' : ''}{formattedValue}
                </p>
            </CardContent>
        </Card>
    );
}

interface OverallSummaryCardProps {
    metricsByUnit: Map<string, FinancialMetricsByUnit>;
}

function OverallSummaryCard({ metricsByUnit }: OverallSummaryCardProps) {
    return (
        <Card className="bg-muted/30">
            <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Overall Summary by Unit</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from(metricsByUnit.entries()).map(([unit, metrics]) => (
                        <div key={unit} className="text-sm">
                            <span className="font-medium">{unit}:</span>
                            <span className={`ml-2 ${metrics.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.netChange > 0 ? '+' : ''}{metrics.netChange.toFixed(2)}
              </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}