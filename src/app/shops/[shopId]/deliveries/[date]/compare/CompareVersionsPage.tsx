"use client";

import VersionComparisonPage from "@/components/VersionComparisonPage";
import { DeliveryTabs } from "@/components/DeliveryTabs";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";

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
