"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  BarChart2,
  Building2,
  Users,
  Package,
  GitBranch,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserDropdown from "@/components/user/UserDropdown";
import { getUserRoles, hasRole, getCompanyId } from "@delivery-system/api-client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // Which roles can see this item
  customLabel?: Record<string, string>; // Role-specific labels
};

const navItems: NavItem[] = [
  {
    label: "Insights",
    href: "/insights",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    label: "Companies",
    href: "/companies",
    icon: <Building2 className="h-5 w-5" />,
    customLabel: {
      MANAGER: "Company",
    },
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Products",
    href: "/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Import Products",
    href: "/products/import",
    icon: <Package className="h-5 w-5" />,
    roles: ["ADMIN"], // Only admins can see this
  },
  {
    label: "Shop Activation",
    href: "/products/shop-activation",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Workflows",
    href: "/workflows",
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    label: "Templates",
    href: "/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["MANAGER"], // Only managers can see this
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get user roles and company info from cookies
  const userRoles = getUserRoles();
  const companyId = getCompanyId();
  const isAdmin = hasRole("ADMIN");
  const isManager = hasRole("MANAGER");

  useEffect(() => {
    // Redirect managers away from companies list to their assigned company
    if (isManager && pathname === "/companies" && companyId) {
      router.push(`/companies/${companyId}`);
    }
  }, [pathname, isManager, companyId, router]);

  const filteredNavItems = navItems
      .filter((item) => {
        // If item has specific role requirements, check them
        if (item.roles && item.roles.length > 0) {
          return item.roles.some(role => hasRole(role));
        }
        // Otherwise, item is available to all authenticated users
        return true;
      })
      .map((item) => {
        // Apply custom labels based on user role
        if (item.customLabel) {
          const roleLabel = userRoles.find(role => item.customLabel?.[role]);
          if (roleLabel && item.customLabel[roleLabel]) {
            return { ...item, label: item.customLabel[roleLabel] };
          }
        }
        return item;
      });

  // Adjust company link for managers
  const getNavHref = (item: NavItem) => {
    if (item.href === "/companies" && isManager && companyId) {
      return `/companies/${companyId}`;
    }
    return item.href;
  };

  return (
      <>
        {/* Mobile Navigation - Top Bar */}
        <div className="lg:hidden w-full">
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="font-bold text-xl">LogiSaaS</div>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto p-0">
                <div className="bg-background">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="font-bold text-xl">LogiSaaS</div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 px-4">
                      {filteredNavItems.map((item) => {
                        const href = getNavHref(item);
                        return (
                            <Link
                                key={item.href}
                                href={href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                                    pathname === href
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50",
                                )}
                            >
                              {item.icon}
                              <span className="text-xs">{item.label}</span>
                            </Link>
                        );
                      })}
                    </div>
                    <div className="px-4 pt-4 border-t">
                      <UserDropdown />
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation - Left Sidebar */}
        <div
            className={cn(
                "hidden lg:flex lg:flex-col lg:border-r bg-background transition-all duration-300",
                isCollapsed ? "lg:w-[60px]" : "lg:w-[240px]",
            )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!isCollapsed && <div className="font-bold text-xl">LogiSaaS</div>}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn("ml-auto", isCollapsed && "mx-auto")}
            >
              {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
              ) : (
                  <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="p-2 border-b">
            <UserDropdown isCollapsed={isCollapsed} />
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <ul className="space-y-1 px-2">
              {filteredNavItems.map((item) => {
                const href = getNavHref(item);
                return (
                    <li key={item.href}>
                      <Link
                          href={href}
                          className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isCollapsed ? "justify-center" : "gap-3",
                              pathname === href
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent/50",
                          )}
                          title={isCollapsed ? item.label : undefined}
                      >
                        {item.icon}
                        {!isCollapsed && item.label}
                      </Link>
                    </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </>
  );
}