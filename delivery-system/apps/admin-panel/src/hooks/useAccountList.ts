"use client";

import { useState, useMemo } from "react";
import {
  Account,
  AccountFilters,
  AccountSortOption,
  AccountFormData,
} from "@/types/company";

// Mock data
const mockAccounts: Account[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@sdt.com",
    role: "Admin",
    status: "Active",
    lastActive: "2024-01-08T14:20:00Z",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2024-01-08T14:20:00Z",
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "manager@sdt.com",
    role: "Manager",
    status: "Active",
    companyId: "1",
    companyName: "Acme Logistics",
    lastActive: "2024-01-08T12:15:00Z",
    createdAt: "2023-02-20T11:15:00Z",
    updatedAt: "2024-01-08T12:15:00Z",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@acmelogistics.com",
    role: "Shop Assistant",
    status: "Active",
    companyId: "1",
    companyName: "Acme Logistics",
    lastActive: "2024-01-08T10:30:00Z",
    createdAt: "2023-03-10T09:45:00Z",
    updatedAt: "2024-01-08T10:30:00Z",
  },
  {
    id: "4",
    name: "Lisa Chen",
    email: "lisa.chen@acmelogistics.com",
    role: "Delivery",
    status: "Active",
    companyId: "1",
    companyName: "Acme Logistics",
    lastActive: "2024-01-07T16:45:00Z",
    createdAt: "2023-04-05T14:20:00Z",
    updatedAt: "2024-01-07T16:45:00Z",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@globalshipping.com",
    role: "Manager",
    status: "Active",
    companyId: "2",
    companyName: "Global Shipping Co",
    lastActive: "2024-01-08T09:20:00Z",
    createdAt: "2023-05-12T16:30:00Z",
    updatedAt: "2024-01-08T09:20:00Z",
  },
  {
    id: "6",
    name: "Emma Davis",
    email: "emma.davis@globalshipping.com",
    role: "Shop Assistant",
    status: "Suspended",
    companyId: "2",
    companyName: "Global Shipping Co",
    lastActive: "2023-12-20T14:30:00Z",
    createdAt: "2023-06-18T11:00:00Z",
    updatedAt: "2023-12-20T14:30:00Z",
  },
  {
    id: "7",
    name: "Robert Brown",
    email: "robert.brown@fasttrack.com",
    role: "Delivery",
    status: "Active",
    companyId: "3",
    companyName: "FastTrack Delivery",
    lastActive: "2024-01-08T08:15:00Z",
    createdAt: "2023-07-25T12:00:00Z",
    updatedAt: "2024-01-08T08:15:00Z",
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    email: "jennifer.taylor@metrotransport.com",
    role: "Manager",
    status: "Active",
    companyId: "4",
    companyName: "Metro Transport",
    lastActive: "2024-01-07T15:40:00Z",
    createdAt: "2023-08-14T14:15:00Z",
    updatedAt: "2024-01-07T15:40:00Z",
  },
  {
    id: "9",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@metrotransport.com",
    role: "Shop Assistant",
    status: "Active",
    companyId: "4",
    companyName: "Metro Transport",
    lastActive: "2024-01-08T11:25:00Z",
    createdAt: "2023-09-20T10:20:00Z",
    updatedAt: "2024-01-08T11:25:00Z",
  },
  {
    id: "10",
    name: "Maria Garcia",
    email: "maria.garcia@coastalfreight.com",
    role: "Delivery",
    status: "Suspended",
    companyId: "5",
    companyName: "Coastal Freight",
    lastActive: "2023-11-15T13:10:00Z",
    createdAt: "2023-10-08T15:40:00Z",
    updatedAt: "2023-11-15T13:10:00Z",
  },
];

export function useAccountList() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [filters, setFilters] = useState<AccountFilters>({
    search: "",
    role: "all",
    status: "all",
  });
  const [sortOption, setSortOption] = useState<AccountSortOption>({
    field: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get user role and company for filtering
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const assignedCompanyId =
    typeof window !== "undefined"
      ? localStorage.getItem("assignedCompanyId")
      : null;

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter((account) => {
      // Role-based filtering: Managers only see accounts in their company
      if (userRole === "manager" && assignedCompanyId) {
        if (account.companyId !== assignedCompanyId) {
          return false;
        }
      }

      const matchesSearch =
        account.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        account.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole =
        filters.role === "all" || account.role === filters.role;
      const matchesStatus =
        filters.status === "all" || account.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      }

      return sortOption.direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [accounts, filters, sortOption, userRole, assignedCompanyId]);

  const totalPages = Math.ceil(filteredAndSortedAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAndSortedAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const addAccount = (accountData: AccountFormData) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      ...accountData,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add company name if companyId is provided
    if (newAccount.companyId) {
      // In a real app, this would fetch from the companies list
      const companyNames: { [key: string]: string } = {
        "1": "Acme Logistics",
        "2": "Global Shipping Co",
        "3": "FastTrack Delivery",
        "4": "Metro Transport",
        "5": "Coastal Freight",
      };
      newAccount.companyName = companyNames[newAccount.companyId];
    }

    setAccounts((prev) => [newAccount, ...prev]);
  };

  const updateAccount = (id: string, accountData: AccountFormData) => {
    setAccounts((prev) =>
      prev.map((account) => {
        if (account.id === id) {
          const updatedAccount = {
            ...account,
            ...accountData,
            updatedAt: new Date().toISOString(),
          };

          // Update company name if companyId changed
          if (updatedAccount.companyId) {
            const companyNames: { [key: string]: string } = {
              "1": "Acme Logistics",
              "2": "Global Shipping Co",
              "3": "FastTrack Delivery",
              "4": "Metro Transport",
              "5": "Coastal Freight",
            };
            updatedAccount.companyName = companyNames[updatedAccount.companyId];
          } else {
            updatedAccount.companyName = undefined;
          }

          return updatedAccount;
        }
        return account;
      }),
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  };

  const suspendAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? {
              ...account,
              status: "Suspended" as const,
              updatedAt: new Date().toISOString(),
            }
          : account,
      ),
    );
  };

  const reactivateAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? {
              ...account,
              status: "Active" as const,
              updatedAt: new Date().toISOString(),
            }
          : account,
      ),
    );
  };

  const getAccountById = (id: string) => {
    return accounts.find((account) => account.id === id);
  };

  const updateFilters = (newFilters: Partial<AccountFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateSort = (newSort: AccountSortOption) => {
    setSortOption(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const stats = useMemo(() => {
    const visibleAccounts =
      userRole === "manager" && assignedCompanyId
        ? accounts.filter((a) => a.companyId === assignedCompanyId)
        : accounts;

    const total = visibleAccounts.length;
    const active = visibleAccounts.filter((a) => a.status === "Active").length;
    const suspended = visibleAccounts.filter(
      (a) => a.status === "Suspended",
    ).length;
    const admins = visibleAccounts.filter((a) => a.role === "Admin").length;
    const managers = visibleAccounts.filter((a) => a.role === "Manager").length;
    const shopAssistants = visibleAccounts.filter(
      (a) => a.role === "Shop Assistant",
    ).length;
    const delivery = visibleAccounts.filter(
      (a) => a.role === "Delivery",
    ).length;

    return {
      total,
      active,
      suspended,
      admins,
      managers,
      shopAssistants,
      delivery,
    };
  }, [accounts, userRole, assignedCompanyId]);

  return {
    accounts: paginatedAccounts,
    allAccounts: accounts,
    filters,
    sortOption,
    currentPage,
    totalPages,
    itemsPerPage,
    stats,
    addAccount,
    updateAccount,
    deleteAccount,
    suspendAccount,
    reactivateAccount,
    getAccountById,
    updateFilters,
    updateSort,
    goToPage,
    totalItems: filteredAndSortedAccounts.length,
    userRole,
    assignedCompanyId,
  };
}
