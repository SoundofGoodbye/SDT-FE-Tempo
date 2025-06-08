//delivery-system/apps/delivery-tracker/src/app/shops/[shopId]/deliveries/[date]/compare/page.tsx
"use client";

import VersionComparisonPage from "@/components/feature/VersionComparisonPage";
import { DeliveryTabs } from "@/components/feature/DeliveryTabs";
import { useParams } from "next/navigation";
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Use app wrapper

export default function CompareVersionsPage() {
    // Use the auth hook to protect this page
    useRequireAuth();

    const params = useParams();
    const shopId = params.shopId as string;
    const date = params.date as string;

    return (
        <div className="container mx-auto py-6">
            <DeliveryTabs shopId={shopId} date={date} />
            <VersionComparisonPage />
        </div>
    );
}