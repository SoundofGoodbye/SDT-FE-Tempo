"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  Users,
  Package,
  DollarSign,
  Store,
  ArrowLeft,
  ExternalLink,
  Settings,
  Upload,
  UserPlus,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useShopList } from "@/hooks/useShopList";
import { Shop, ShopFormData } from "@/types/company";
import ShopTable from "@/components/shops/ShopTable";
import ShopFormModal from "@/components/shops/ShopFormModal";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import Link from "next/link";
import { hasRole, getCompanyId } from "@delivery-system/api-client";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user role and company from auth
  const isAdmin = hasRole("ADMIN");
  const isManager = hasRole("MANAGER");
  const userCompanyId = getCompanyId();

  // Check if user has access to this company
  const hasAccess = isAdmin || (isManager && userCompanyId === Number(companyId));

  const { getCompanyById } = useCompanyList();
  const {
    shops,
    filters,
    sortOption,
    currentPage,
    totalPages,
    stats,
    addShop,
    updateShop,
    deleteShop,
    updateFilters,
    updateSort,
    goToPage,
    totalItems,
  } = useShopList(companyId);

  const company = getCompanyById(companyId);

  if (!hasAccess) {
    return (
        <ForbiddenPage
            title="Access Denied"
            description="You can only access your assigned company. Please contact your administrator if you believe this is an error."
        />
    );
  }

  if (!company) {
    return (
        <div className="bg-background p-6 md:p-8 w-full min-h-screen">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Company not found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The company you're looking for doesn't exist or has been removed.
              </p>
              <Link href={isAdmin ? "/companies" : "/insights"}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
    );
  }

  const handleAddShop = () => {
    setEditingShop(null);
    setIsShopModalOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setIsShopModalOpen(true);
  };

  const handleDeleteShop = (id: string) => {
    if (
        window.confirm(
            "Are you sure you want to delete this shop? This action cannot be undone.",
        )
    ) {
      deleteShop(id);
    }
  };

  const handleSubmitShop = async (data: ShopFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingShop) {
        updateShop(editingShop.id, data);
      } else {
        addShop(data);
      }
      setIsShopModalOpen(false);
      setEditingShop(null);
    } catch (error) {
      console.error("Error submitting shop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPlanColor = (plan: string) => {
    return plan === "Pro" ? "default" : "outline";
  };

  return (
      <div className="bg-background p-6 md:p-8 w-full min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {isAdmin && (
                <Link href="/companies">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Companies
                  </Button>
                </Link>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {company.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                Company details and shop management
              </p>
            </div>
          </div>
        </div>

        {/* Company Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Store className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Store className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.active}</div>
                </div>
                <Badge variant="default">
                  {stats.total > 0
                      ? Math.round((stats.active / stats.total) * 100)
                      : 0}
                  %
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge
                    variant={getPlanColor(company.plan)}
                    className="text-lg px-3 py-1"
                >
                  {company.plan}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  {formatCurrency(company.revenue)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Contact
                </h4>
                <div className="space-y-1 text-sm">
                  <div>{company.email}</div>
                  <div>{company.phone}</div>
                  <div className="text-muted-foreground">{company.address}</div>
                  {company.website && (
                      <div>
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {company.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Status
                </h4>
                <div className="space-y-2">
                  <Badge variant={getStatusColor(company.status)}>
                    {company.status}
                  </Badge>
                  {company.description && (
                      <p className="text-sm text-muted-foreground">
                        {company.description}
                      </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push('/products/import')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Product Import
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push('/accounts')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Company Users
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push('/products/shop-activation')}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Shop Activation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Management Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shop Management</CardTitle>
                <CardDescription>
                  Manage shop locations for {company.name}
                </CardDescription>
              </div>
              <Button onClick={handleAddShop}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shop
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search shops..."
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      className="pl-10"
                  />
                </div>

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
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
                    <SelectItem value="address-asc">Location (A-Z)</SelectItem>
                    <SelectItem value="address-desc">Location (Z-A)</SelectItem>
                    <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                    <SelectItem value="createdAt-desc">Newest</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {shops.length} of {totalItems} shops
                {filters.search && ` matching "${filters.search}"`}
                {filters.status !== "all" && " with current filters"}
              </p>
            </div>

            {/* Shop Table */}
            <ShopTable
                shops={shops}
                onEdit={handleEditShop}
                onDelete={handleDeleteShop}
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

        {/* Shop Form Modal */}
        <ShopFormModal
            isOpen={isShopModalOpen}
            onClose={() => {
              setIsShopModalOpen(false);
              setEditingShop(null);
            }}
            onSubmit={handleSubmitShop}
            shop={editingShop}
            isLoading={isSubmitting}
        />
      </div>
  );
}