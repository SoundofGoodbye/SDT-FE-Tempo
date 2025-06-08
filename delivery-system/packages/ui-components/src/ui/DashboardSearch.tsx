"use client";

import { useEffect } from "react";

interface DashboardSearchProps {
  onTabChange: (tab: string | null) => void;
  currentTab: string | null; // Pass the tab value from the app
}

export function DashboardSearch({ onTabChange, currentTab }: DashboardSearchProps) {
  // Call the callback whenever the tab changes
  useEffect(() => {
    onTabChange(currentTab);
  }, [currentTab, onTabChange]);

  // This component doesn't need to render anything visible
  return null;
}