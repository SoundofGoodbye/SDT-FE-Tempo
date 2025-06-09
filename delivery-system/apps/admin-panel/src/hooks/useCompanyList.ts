"use client";

import { useState, useMemo } from "react";
import {
  Company,
  CompanyFilters,
  CompanySortOption,
  CompanyFormData,
} from "@/types/company";

// Mock data
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Logistics",
    email: "contact@acmelogistics.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, New York, NY 10001",
    website: "https://acmelogistics.com",
    description: "Leading logistics solutions provider",
    shopsCount: 12,
    usersCount: 45,
    productsCount: 234,
    revenue: 125000,
    plan: "Pro",
    status: "Active",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2024-01-08T14:20:00Z",
  },
  {
    id: "2",
    name: "Global Shipping Co",
    email: "info@globalshipping.com",
    phone: "+1 (555) 987-6543",
    address: "456 Commerce St, Los Angeles, CA 90210",
    website: "https://globalshipping.com",
    description: "International shipping and freight services",
    shopsCount: 8,
    usersCount: 32,
    productsCount: 156,
    revenue: 89000,
    plan: "Pro",
    status: "Active",
    createdAt: "2023-03-22T09:15:00Z",
    updatedAt: "2024-01-07T11:45:00Z",
  },
  {
    id: "3",
    name: "FastTrack Delivery",
    email: "support@fasttrack.com",
    phone: "+1 (555) 456-7890",
    address: "789 Speed Lane, Chicago, IL 60601",
    website: "https://fasttrackdelivery.com",
    description: "Same-day delivery specialists",
    shopsCount: 5,
    usersCount: 18,
    productsCount: 89,
    revenue: 45000,
    plan: "Basic",
    status: "Active",
    createdAt: "2023-06-10T16:45:00Z",
    updatedAt: "2024-01-06T09:30:00Z",
  },
  {
    id: "4",
    name: "Metro Transport",
    email: "hello@metrotransport.com",
    phone: "+1 (555) 321-0987",
    address: "321 Transit Blvd, Houston, TX 77001",
    description: "Urban transportation solutions",
    shopsCount: 15,
    usersCount: 67,
    productsCount: 312,
    revenue: 156000,
    plan: "Pro",
    status: "Active",
    createdAt: "2022-11-05T13:20:00Z",
    updatedAt: "2024-01-05T16:10:00Z",
  },
  {
    id: "5",
    name: "Coastal Freight",
    email: "contact@coastalfreight.com",
    phone: "+1 (555) 654-3210",
    address: "654 Harbor Dr, Miami, FL 33101",
    website: "https://coastalfreight.com",
    description: "Coastal and marine logistics",
    shopsCount: 3,
    usersCount: 12,
    productsCount: 67,
    revenue: 28000,
    plan: "Basic",
    status: "Inactive",
    createdAt: "2023-08-18T11:00:00Z",
    updatedAt: "2023-12-20T14:30:00Z",
  },
  {
    id: "6",
    name: "Express Solutions",
    email: "info@expresssolutions.com",
    phone: "+1 (555) 789-0123",
    address: "987 Express Way, Phoenix, AZ 85001",
    description: "Express delivery and courier services",
    shopsCount: 7,
    usersCount: 25,
    productsCount: 134,
    revenue: 67000,
    plan: "Basic",
    status: "Active",
    createdAt: "2023-04-12T08:45:00Z",
    updatedAt: "2024-01-04T12:15:00Z",
  },
  {
    id: "7",
    name: "Prime Logistics",
    email: "contact@primelogistics.com",
    phone: "+1 (555) 147-2580",
    address: "147 Prime St, Seattle, WA 98101",
    website: "https://primelogistics.com",
    description: "Premium logistics and supply chain management",
    shopsCount: 20,
    usersCount: 89,
    productsCount: 445,
    revenue: 234000,
    plan: "Pro",
    status: "Active",
    createdAt: "2022-09-30T15:30:00Z",
    updatedAt: "2024-01-08T10:45:00Z",
  },
  {
    id: "8",
    name: "Swift Cargo",
    email: "support@swiftcargo.com",
    phone: "+1 (555) 369-2580",
    address: "369 Swift Ave, Denver, CO 80201",
    description: "Cargo and freight transportation",
    shopsCount: 4,
    usersCount: 16,
    productsCount: 78,
    revenue: 34000,
    plan: "Basic",
    status: "Suspended",
    createdAt: "2023-07-25T12:00:00Z",
    updatedAt: "2023-12-15T09:20:00Z",
  },
  {
    id: "9",
    name: "Reliable Routes",
    email: "info@reliableroutes.com",
    phone: "+1 (555) 258-1470",
    address: "258 Route Rd, Boston, MA 02101",
    website: "https://reliableroutes.com",
    description: "Reliable routing and delivery services",
    shopsCount: 9,
    usersCount: 38,
    productsCount: 189,
    revenue: 78000,
    plan: "Pro",
    status: "Active",
    createdAt: "2023-02-14T14:15:00Z",
    updatedAt: "2024-01-03T13:25:00Z",
  },
  {
    id: "10",
    name: "Urban Delivery",
    email: "hello@urbandelivery.com",
    phone: "+1 (555) 741-9630",
    address: "741 Urban St, Portland, OR 97201",
    description: "Urban and suburban delivery network",
    shopsCount: 6,
    usersCount: 22,
    productsCount: 112,
    revenue: 52000,
    plan: "Basic",
    status: "Active",
    createdAt: "2023-05-08T10:20:00Z",
    updatedAt: "2024-01-02T15:40:00Z",
  },
  {
    id: "11",
    name: "National Freight",
    email: "contact@nationalfreight.com",
    phone: "+1 (555) 852-9630",
    address: "852 National Blvd, Atlanta, GA 30301",
    website: "https://nationalfreight.com",
    description: "Nationwide freight and logistics solutions",
    shopsCount: 25,
    usersCount: 112,
    productsCount: 567,
    revenue: 345000,
    plan: "Pro",
    status: "Active",
    createdAt: "2022-08-12T09:30:00Z",
    updatedAt: "2024-01-08T11:20:00Z",
  },
  {
    id: "12",
    name: "Quick Ship",
    email: "support@quickship.com",
    phone: "+1 (555) 963-7410",
    address: "963 Quick Ave, Las Vegas, NV 89101",
    description: "Quick shipping and express delivery",
    shopsCount: 2,
    usersCount: 8,
    productsCount: 45,
    revenue: 18000,
    plan: "Basic",
    status: "Active",
    createdAt: "2023-09-20T16:45:00Z",
    updatedAt: "2024-01-01T08:15:00Z",
  },
];

export function useCompanyList() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
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

  const totalPages = Math.ceil(
    filteredAndSortedCompanies.length / itemsPerPage,
  );
  const paginatedCompanies = filteredAndSortedCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const addCompany = (companyData: CompanyFormData) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      ...companyData,
      shopsCount: 0,
      usersCount: 0,
      productsCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newCompany, ...prev]);
  };

  const updateCompany = (id: string, companyData: CompanyFormData) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id
          ? { ...company, ...companyData, updatedAt: new Date().toISOString() }
          : company,
      ),
    );
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));
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
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedCompanies.length,
  };
}
