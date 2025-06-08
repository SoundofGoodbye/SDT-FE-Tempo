"use client";

import DeliveryVersionsListPage from "@/components/feature/DeliveryVersionsListPage";
import { DeliveryTabs } from "@/components/feature/DeliveryTabs";
import { useParams } from "next/navigation";
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Use app wrapper
import { getCompanyId } from '@delivery-system/api-client';

export default function VersionsPage() {
    // Use the auth hook to protect this page
    useRequireAuth();

    const params = useParams();
    const shopId = params.shopId as string;
    const date = params.date as string;

    // Get company ID from auth
    const companyId = getCompanyId()?.toString() || "1";

    return (
        <div className="container mx-auto py-6">
            <DeliveryTabs shopId={shopId} date={date} />
            <DeliveryVersionsListPage shopId={shopId} date={date} companyId={companyId} />
        </div>
    );
}