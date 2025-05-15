"use client";

import DeliveryVersionsListPage from "@/components/DeliveryVersionsListPage";
import { useParams } from "next/navigation";

export default function VersionsPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const date = params.date as string;
  const companyId = "1"; // Hard-coded as per requirements

  return <DeliveryVersionsListPage shopId={shopId} date={date} companyId={companyId} />;
}
