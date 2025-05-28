"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface DashboardSearchProps {
  onTabChange: (tab: string | null) => void;
}

export function DashboardSearch({ onTabChange }: DashboardSearchProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  useEffect(() => {
    onTabChange(tabParam);
  }, [tabParam, onTabChange]);
  
  // This component doesn't need to render anything visible
  return null;
}