"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!authToken);

    // In a real app, you would fetch the user's name from an API
    // For now, we'll just use a default name
    setUsername("Demo User");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("companyId");
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold text-lg">SimpleDeliveryTracker</span>
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center">
            <nav className="flex items-center space-x-4 mr-6">
              <Link 
                href="/dashboard" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard" && (!tabParam || tabParam === "dashboard")
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard?tab=history" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard" && tabParam === "history"
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                Delivery History
              </Link>
              <Link 
                href="/dashboard?tab=calendar" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard" && tabParam === "calendar"
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                Calendar
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
