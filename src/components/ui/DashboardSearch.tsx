"use client";

import { useSearchParams } from "next/navigation";

interface DashboardSearchProps {
  onTabChange: (tab: string | null) => void;
}

export function DashboardSearch({ onTabChange }: DashboardSearchProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Call the callback with the tab parameter
  onTabChange(tabParam);
  
  // This component doesn't need to render anything visible
  return null;
}