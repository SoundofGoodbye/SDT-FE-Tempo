"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
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
    adminOnly: true,
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
    adminOnly: false, // Available to managers
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    // Redirect managers away from companies list
    if (role === "manager" && pathname === "/companies") {
      const assignedCompanyId = localStorage.getItem("assignedCompanyId");
      if (assignedCompanyId) {
        window.location.href = `/companies/${assignedCompanyId}`;
      }
    }
  }, [pathname]);

  const filteredNavItems = navItems
    .filter((item) => {
      // Hide admin-only items from non-admin users
      if (item.adminOnly && userRole !== "admin") {
        return false;
      }
      // Hide settings from admins (only for managers)
      if (item.href === "/settings" && userRole !== "manager") {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.href === "/companies" && userRole === "manager") {
        return { ...item, label: "Company" };
      }
      return item;
    });

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("assignedCompanyId");
    window.location.href = "/login";
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
                    {filteredNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                        )}
                      >
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 pt-4 border-t">
                    <UserDropdown onLogout={handleLogout} />
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
          <UserDropdown onLogout={handleLogout} isCollapsed={isCollapsed} />
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center" : "gap-3",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
