"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DeliveryTabsProps {
  shopId: string;
  date: string;
}

export function DeliveryTabs({ shopId, date }: DeliveryTabsProps) {
  const pathname = usePathname();
  
  // Define the tabs
  const tabs = [
    {
      name: "Versions",
      href: `/shops/${shopId}/deliveries/${date}/versions`,
      active: pathname === `/shops/${shopId}/deliveries/${date}/versions`,
    },
    {
      name: "Compare",
      href: `/shops/${shopId}/deliveries/${date}/compare`,
      active: pathname === `/shops/${shopId}/deliveries/${date}/compare`,
    },
    {
      name: "Matrix",
      href: `/shops/${shopId}/deliveries/${date}/matrix`,
      active: pathname === `/shops/${shopId}/deliveries/${date}/matrix`,
    },
  ];

  return (
    <div className="border-b mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm",
              tab.active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
}