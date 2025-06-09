//delivery-system/apps/admin-panel/src/hooks/useCompanyList.ts
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { companyService } from "@delivery-system/api-client";
import type { CompanyExtended } from "@delivery-system/types";
import {
  Company,
  CompanyFilters,
  CompanySortOption,
  CompanyFormData,
} from "@/types/company";

// Helper to convert BE CompanyExtended to FE Company type
const mapToFECompany = (beCompany: CompanyExtended): Company => ({
  id: beCompany.id.toString(),
  name: beCompany.companyName,
  email: beCompany.email || '',
  phone: beCompany.phone || '',
  address: beCompany.address || '',
  website: beCompany.website,
  description: beCompany.description,
  shopsCount: beCompany.shopsCount || 0,
  usersCount: beCompany.usersCount || 0,
  productsCount: beCompany.productsCount || 0,
  revenue: beCompany.revenue || 0,
  plan: beCompany.plan || 'Basic',
  status: beCompany.status || 'Active',
  createdAt: beCompany.createdAt || new Date().toISOString(),
  updatedAt: beCompany.updatedAt || new Date().toISOString(),
});

export function useCompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CompanyFilters>({
    search: "",
    plan: "all",
    status: "all",
  });
  const [sortOption, setSortOption] = useState<CompanySortOption>({
    field: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Note: BE doesn't support these params yet, but we're sending them for future compatibility
      const beCompanies = await companyService.getAllCompanies({
        page: currentPage,
        limit: itemsPerPage,
        search: filters.search !== "" ? filters.search : undefined,
        sortField: sortOption.field,
        sortDirection: sortOption.direction,
        plan: filters.plan !== "all" ? filters.plan : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
      });

      const mappedCompanies = beCompanies.map(mapToFECompany);
      setCompanies(mappedCompanies);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, sortOption]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Since BE doesn't support filtering/sorting yet, we do it client-side
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter((company) => {
      const matchesSearch =
          company.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          company.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPlan =
          filters.plan === "all" || company.plan === filters.plan;
      const matchesStatus =
          filters.status === "all" || company.status === filters.status;

      return matchesSearch && matchesPlan && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      }

      return sortOption.direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [companies, filters, sortOption]);

  // Client-side pagination (until BE supports it)
  const totalPages = Math.ceil(
      filteredAndSortedCompanies.length / itemsPerPage,
  );
  const paginatedCompanies = filteredAndSortedCompanies.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
  );

  const addCompany = async (companyData: CompanyFormData) => {
    try {
      const newCompany = await companyService.createCompany({
        companyName: companyData.name,
      });

      // Refresh the list
      await fetchCompanies();
    } catch (err) {
      console.error('Failed to create company:', err);
      throw err;
    }
  };

  const updateCompany = async (id: string, companyData: CompanyFormData) => {
    try {
      await companyService.updateCompany(parseInt(id), {
        companyName: companyData.name,
      });

      // Refresh the list
      await fetchCompanies();
    } catch (err) {
      console.error('Failed to update company:', err);
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await companyService.deleteCompany(parseInt(id));

      // Refresh the list
      await fetchCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
      throw err;
    }
  };

  const getCompanyById = (id: string) => {
    return companies.find((company) => company.id === id);
  };

  const updateFilters = (newFilters: Partial<CompanyFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateSort = (newSort: CompanySortOption) => {
    setSortOption(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === "Active").length;
    const pro = companies.filter((c) => c.plan === "Pro").length;
    const totalRevenue = companies.reduce((sum, c) => sum + c.revenue, 0);

    return {
      total,
      active,
      pro,
      basic: total - pro,
      totalRevenue,
    };
  }, [companies]);

  return {
    companies: paginatedCompanies,
    allCompanies: companies,
    filters,
    sortOption,
    currentPage,
    totalPages,
    itemsPerPage,
    stats,
    loading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedCompanies.length,
    refetch: fetchCompanies,
  };
}