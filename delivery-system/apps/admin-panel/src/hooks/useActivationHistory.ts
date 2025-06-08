"use client";

import { useState, useMemo } from "react";
import { ActivationHistoryEntry } from "@/types/product-activation";

// Mock data for activation history
const mockActivationHistory: ActivationHistoryEntry[] = [
  {
    id: "1",
    date: "2024-01-09T10:30:00Z",
    productId: "6",
    productCode: "ACM-006",
    productName: "Express Tape Roll",
    action: "Activated",
    shopNames: ["Airport Branch"],
    performedBy: "Sarah Manager",
  },
  {
    id: "2",
    date: "2024-01-08T16:45:00Z",
    productId: "1",
    productCode: "ACM-001",
    productName: "Standard Shipping Box",
    action: "Assigned to shops",
    shopNames: ["Downtown Hub"],
    performedBy: "Sarah Manager",
  },
  {
    id: "3",
    date: "2024-01-08T14:20:00Z",
    productId: "4",
    productCode: "ACM-004",
    productName: "Tracking Labels",
    action: "Activated",
    shopNames: ["Downtown Hub", "Airport Branch"],
    performedBy: "Mike Johnson",
  },
  {
    id: "4",
    date: "2024-01-07T11:15:00Z",
    productId: "2",
    productCode: "ACM-002",
    productName: "Express Envelope",
    action: "Deactivated",
    shopNames: ["Airport Branch"],
    performedBy: "Sarah Manager",
  },
  {
    id: "5",
    date: "2024-01-06T15:30:00Z",
    productId: "3",
    productCode: "ACM-003",
    productName: "Premium Bubble Wrap",
    action: "Assigned to shops",
    shopNames: ["Downtown Hub"],
    performedBy: "Sarah Manager",
  },
];

export function useActivationHistory(companyId: string) {
  const [history, setHistory] = useState<ActivationHistoryEntry[]>(
    mockActivationHistory,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const addHistoryEntry = (
    entry: Omit<ActivationHistoryEntry, "id" | "date" | "performedBy">,
  ) => {
    const newEntry: ActivationHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      performedBy: "Manager", // This would come from the current user context
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return history.slice(startIndex, startIndex + itemsPerPage);
  }, [history, currentPage]);

  const totalPages = Math.ceil(history.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    history: paginatedHistory,
    allHistory: history,
    currentPage,
    totalPages,
    itemsPerPage,
    addHistoryEntry,
    goToPage,
    totalItems: history.length,
  };
}
