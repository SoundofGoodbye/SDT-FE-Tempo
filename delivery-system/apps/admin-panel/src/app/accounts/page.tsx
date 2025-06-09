//delivery-system/apps/admin-panel/src/app/accounts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAccountList } from "@/hooks/useAccountList";
import { Account, AccountFormData } from "@/types/company";
import AccountTable from "@/components/accounts/AccountTable";
import AccountFormModal from "@/components/accounts/AccountFormModal";
import ForbiddenPage from "@/components/system/ForbiddenPage";

export default function AccountsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    accounts,
    filters,
    sortOption,
    currentPage,
    totalPages,
    stats,
    addAccount,
    updateAccount,
    deleteAccount,
    suspendAccount,
    reactivateAccount,
    updateFilters,
    updateSort,
    goToPage,
    totalItems,
    assignedCompanyId,
  } = useAccountList();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (!isAuthenticated || !role) {
      window.location.href = "/login";
      return;
    }

    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has access to accounts page
  if (!userRole || (userRole !== "admin" && userRole !== "manager")) {
    return (
      <ForbiddenPage
        title="Access Denied"
        description="You don't have permission to access the accounts management page. Please contact your administrator."
      />
    );
  }

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This action cannot be undone.",
      )
    ) {
      deleteAccount(id);
    }
  };

  const handleSuspendAccount = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to suspend this account? The user will lose access to the system.",
      )
    ) {
      suspendAccount(id);
    }
  };

  const handleReactivateAccount = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to reactivate this account? The user will regain access to the system.",
      )
    ) {
      reactivateAccount(id);
    }
  };

  const handleSubmitAccount = async (data: AccountFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingAccount) {
        updateAccount(editingAccount.id, data);
      } else {
        addAccount(data);
      }
      setIsAccountModalOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error("Error submitting account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background p-6 md:p-8 w-full min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground mt-2">
              {userRole === "admin"
                ? "Manage all user accounts across the platform"
                : "Manage user accounts for your company"}
            </p>
          </div>
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.active}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.total > 0
                  ? Math.round((stats.active / stats.total) * 100)
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserX className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.suspended}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "admin" ? "Admins" : "Managers"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {userRole === "admin" ? stats.admins : stats.managers}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                {userRole === "admin"
                  ? "Manage all user accounts across companies"
                  : "Manage user accounts for your company"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.role}
                onValueChange={(value) => updateFilters({ role: value as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {userRole === "admin" && (
                    <SelectItem value="Admin">Admin</SelectItem>
                  )}
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Shop Assistant">Shop Assistant</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  updateFilters({ status: value as any })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortOption.field}-${sortOption.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as [
                    any,
                    "asc" | "desc",
                  ];
                  updateSort({ field, direction });
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                  <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                  <SelectItem value="role-asc">Role (A-Z)</SelectItem>
                  <SelectItem value="lastActive-desc">
                    Recently Active
                  </SelectItem>
                  <SelectItem value="createdAt-desc">Newest</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {accounts.length} of {totalItems} accounts
              {filters.search && ` matching "${filters.search}"`}
              {(filters.role !== "all" || filters.status !== "all") &&
                " with current filters"}
            </p>
          </div>

          {/* Account Table */}
          <AccountTable
            accounts={accounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            onSuspend={handleSuspendAccount}
            onReactivate={handleReactivateAccount}
            userRole={userRole}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Form Modal */}
      <AccountFormModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleSubmitAccount}
        account={editingAccount}
        isLoading={isSubmitting}
        userRole={userRole}
        assignedCompanyId={assignedCompanyId}
      />
    </div>
  );
}
