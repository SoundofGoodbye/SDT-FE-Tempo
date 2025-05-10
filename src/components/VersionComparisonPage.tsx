"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import VersionSelector from "./VersionSelector";
import DiffTable, { DiffItem } from "./DiffTable";
import { ArrowLeft, Download } from "lucide-react";

interface Version {
  id: string;
  stepType: string;
  timestamp: string;
  productListDetailsId: string;
}

interface ProductItem {
  productId: string;
  name: string;
  quantity: number;
  notes: string | null;
}

export default function VersionComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const date = params.date as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");
  const [itemsA, setItemsA] = useState<ProductItem[]>([]);
  const [itemsB, setItemsB] = useState<ProductItem[]>([]);
  const [diffData, setDiffData] = useState<DiffItem[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Get selected version objects
  const selectedVersionA = versions.find((v) => v.id === versionA);
  const selectedVersionB = versions.find((v) => v.id === versionB);

  // Fetch versions metadata on mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoadingVersions(true);
        const companyId = "1"; // Replace with actual company ID from context/auth
        const response = await fetch(
          `/api/company/${companyId}/productList?shopId=${shopId}&date=${date}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch versions");
        }

        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error("Error fetching versions:", error);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [shopId, date]);

  // Fetch details when both versions are selected
  useEffect(() => {
    const fetchVersionDetails = async () => {
      if (!versionA || !versionB || !selectedVersionA || !selectedVersionB) {
        return;
      }

      setIsLoadingDetails(true);
      try {
        const companyId = "1"; // Replace with actual company ID from context/auth

        // Fetch both version details in parallel
        const [responseA, responseB] = await Promise.all([
          fetch(
            `/api/company/${companyId}/productListItems/${selectedVersionA.productListDetailsId}`,
          ),
          fetch(
            `/api/company/${companyId}/productListItems/${selectedVersionB.productListDetailsId}`,
          ),
        ]);

        if (!responseA.ok || !responseB.ok) {
          throw new Error("Failed to fetch version details");
        }

        const dataA = await responseA.json();
        const dataB = await responseB.json();

        setItemsA(dataA);
        setItemsB(dataB);

        // Create diff data
        createDiffData(dataA, dataB);
      } catch (error) {
        console.error("Error fetching version details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchVersionDetails();
  }, [versionA, versionB, selectedVersionA, selectedVersionB]);

  // Create diff data from both item lists
  const createDiffData = (itemsA: ProductItem[], itemsB: ProductItem[]) => {
    // Create a map of all product IDs from both lists
    const productMap = new Map<
      string,
      { name: string; inA: boolean; inB: boolean }
    >();

    itemsA.forEach((item) => {
      productMap.set(item.productId, {
        name: item.name,
        inA: true,
        inB: false,
      });
    });

    itemsB.forEach((item) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        productMap.set(item.productId, { ...existing, inB: true });
      } else {
        productMap.set(item.productId, {
          name: item.name,
          inA: false,
          inB: true,
        });
      }
    });

    // Create diff items
    const diff: DiffItem[] = [];

    productMap.forEach((product, productId) => {
      const itemA = itemsA.find((item) => item.productId === productId);
      const itemB = itemsB.find((item) => item.productId === productId);

      const qtyA = itemA ? itemA.quantity : null;
      const qtyB = itemB ? itemB.quantity : null;
      const delta = (qtyB ?? 0) - (qtyA ?? 0);

      diff.push({
        productId,
        name: product.name,
        qtyA,
        qtyB,
        delta,
        notesA: itemA?.notes || null,
        notesB: itemB?.notes || null,
      });
    });

    // Sort by delta (non-zero first), then by name
    diff.sort((a, b) => {
      // First sort by whether delta is non-zero
      if (a.delta !== 0 && b.delta === 0) return -1;
      if (a.delta === 0 && b.delta !== 0) return 1;

      // Then sort by name
      return a.name.localeCompare(b.name);
    });

    setDiffData(diff);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (diffData.length === 0) return;

    const versionALabel = selectedVersionA
      ? `${selectedVersionA.stepType} (${new Date(selectedVersionA.timestamp).toLocaleString()})`
      : "Version A";
    const versionBLabel = selectedVersionB
      ? `${selectedVersionB.stepType} (${new Date(selectedVersionB.timestamp).toLocaleString()})`
      : "Version B";

    const headers = [
      "Product Name",
      `Qty ${versionALabel}`,
      `Qty ${versionBLabel}`,
      "Delta",
      `Notes ${versionALabel}`,
      `Notes ${versionBLabel}`,
    ];

    const csvRows = [
      headers.join(","),
      ...diffData.map((item) =>
        [
          `"${item.name}"`,
          item.qtyA ?? "",
          item.qtyB ?? "",
          item.delta,
          `"${item.notesA || ""}"`,
          `"${item.notesB || ""}"`,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `version-comparison-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigate back to versions page
  const goBackToVersions = () => {
    router.push(`/shops/${shopId}/deliveries/${date}/versions`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={goBackToVersions}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Versions
        </Button>

        <Button
          onClick={exportToCSV}
          disabled={diffData.length === 0 || isLoadingDetails}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compare Delivery Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <VersionSelector
              label="Compare A"
              versions={versions}
              value={versionA}
              onChange={setVersionA}
              disabled={isLoadingVersions}
            />
            <VersionSelector
              label="Compare B"
              versions={versions}
              value={versionB}
              onChange={setVersionB}
              disabled={isLoadingVersions}
            />
          </div>

          {versionA && versionB ? (
            <DiffTable
              diffData={diffData}
              versionALabel={selectedVersionA?.stepType || "A"}
              versionBLabel={selectedVersionB?.stepType || "B"}
              isLoading={isLoadingDetails}
            />
          ) : (
            <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                {isLoadingVersions
                  ? "Loading versions..."
                  : "Select two versions to compare"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
