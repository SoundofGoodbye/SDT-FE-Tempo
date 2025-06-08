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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCompanyList } from "@/hooks/useCompanyList";
import { Company, CompanyFormData } from "@/types/company";
import CompanyTable from "@/components/companies/CompanyTable";
import CompanyFormModal from "@/components/companies/CompanyFormModal";
import ForbiddenPage from "@/components/system/ForbiddenPage";

export default function CompaniesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    companies,
    filters,
    sortOption,
    currentPage,
    totalPages,
    stats,
    addCompany,
    updateCompany,
    deleteCompany,
    updateFilters,
    updateSort,
    goToPage,
    totalItems,
  } = useCompanyList();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    // Redirect managers to their assigned company
    if (role === "manager") {
      const assignedCompanyId = localStorage.getItem("assignedCompanyId");
      if (assignedCompanyId) {
        window.location.href = `/companies/${assignedCompanyId}`;
        return;
      }
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <ForbiddenPage
        title="Admin Access Required"
        description="This page is only accessible to administrators. Please contact your system administrator if you need access to company management features."
      />
    );
  }

  const handleAddCompany = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? This action cannot be undone.",
      )
    ) {
      deleteCompany(id);
    }
  };

  const handleSubmitCompany = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingCompany) {
        updateCompany(editingCompany.id, data);
      } else {
        addCompany(data);
      }
      setIsModalOpen(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("Error submitting company:", error);
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

  return (
    <div className="bg-background p-6 md:p-8 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Company Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage companies, view their details, and track their performance
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.active}</div>
              </div>
              <Badge variant="default">
                {Math.round((stats.active / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pro Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.pro}</div>
              </div>
              <Badge variant="outline">
                {Math.round((stats.pro / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.plan}
                onValueChange={(value) => updateFilters({ plan: value as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
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
                  <SelectItem value="Inactive">Inactive</SelectItem>
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
                  <SelectItem value="revenue-desc">
                    Revenue (High-Low)
                  </SelectItem>
                  <SelectItem value="revenue-asc">
                    Revenue (Low-High)
                  </SelectItem>
                  <SelectItem value="shopsCount-desc">Shops (Most)</SelectItem>
                  <SelectItem value="usersCount-desc">Users (Most)</SelectItem>
                  <SelectItem value="createdAt-desc">Newest</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddCompany}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {companies.length} of {totalItems} companies
          {filters.search && ` matching "${filters.search}"`}
          {(filters.plan !== "all" || filters.status !== "all") &&
            " with current filters"}
        </p>
      </div>

      {/* Company Table */}
      <CompanyTable
        companies={companies}
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
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
          </CardContent>
        </Card>
      )}

      {/* Company Form Modal */}
      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleSubmitCompany}
        company={editingCompany}
        isLoading={isSubmitting}
      />
    </div>
  );
}
