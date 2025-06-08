"use client";

import { useSearchParams } from "next/navigation";
import { DashboardSearch as BaseDashboardSearch } from "@delivery-system/ui-components";

interface AppDashboardSearchProps {
    onTabChange: (tab: string | null) => void;
}

export function DashboardSearch({ onTabChange }: AppDashboardSearchProps) {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    return <BaseDashboardSearch onTabChange={onTabChange} currentTab={tabParam} />;
}