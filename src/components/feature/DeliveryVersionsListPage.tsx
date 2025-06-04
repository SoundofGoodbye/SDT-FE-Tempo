"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "../ui/button";
import { StepTimeline, DeliveryStep } from "../ui/StepTimeline";
import { VersionList } from "./VersionList";
import { ProductItem } from "@/types/delivery";
import { convertDeliveryStepName } from "@/lib/utils/deliveryUtils";
import { apiClient, ApiResponse } from "@/lib/api/api-client";



interface DeliveryVersionsListPageProps {
  shopId: string;
  date: string;
  companyId: string;
}

export default function DeliveryVersionsListPage({ shopId, date, companyId }: DeliveryVersionsListPageProps) {
  const router = useRouter();

  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [versions, setVersions] = useState<DeliveryStep[]>([]);
  const [selectedStepType, setSelectedStepType] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [viewedVersions, setViewedVersions] = useState<Set<string>>(new Set());

  // Group versions by step type
  const groupedVersions = versions.reduce<Record<string, DeliveryStep[]>>((acc, version) => {
    if (!acc[version.stepType]) {
      acc[version.stepType] = [];
    }
    acc[version.stepType].push(version);
    return acc;
  }, {});

  // Fetch versions on mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoadingVersions(true);
        const response = await apiClient.get<ApiResponse<Array<{
          versionId: number;
          deliveryStepName: string;
          productListDetailsNumber: string;
          productListDetailsId: number;
          stepDescription: string;
          companyId: number;
        }>>>(
          `company/${companyId}/productList?shopId=${shopId}&date=${date}`
        );

        // Map the payload to DeliveryStep format
        const mappedData: DeliveryStep[] = response.payload.map(item => ({
          id: item.versionId.toString(),
          stepType: convertDeliveryStepName(item.deliveryStepName),
          timestamp: new Date().toISOString(), // Using current date as timestamp is not provided in the API
          productListDetailsId: item.productListDetailsId, // Store the productListDetailsId for fetching product items
        }));

        // Sort versions by timestamp
        const sortedVersions = [...mappedData].sort((a, b) =>
            new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
        );

        setVersions(sortedVersions);

        // Select the latest version (last in the sorted array)
        if (sortedVersions.length > 0) {
          const latestVersion = sortedVersions[sortedVersions.length - 1];
          const lastStepType = latestVersion.stepType;
          const lastVersionId = latestVersion.id;

          // Set the selected state
          setSelectedStepType(lastStepType);
          setSelectedVersionId(lastVersionId);

          // Fetch product items for the latest version
          if (latestVersion.productListDetailsId) {
            fetchProductItems(lastVersionId, latestVersion.productListDetailsId);
          } else {
            fetchProductItems(lastVersionId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch versions:", error);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [companyId, shopId, date]);

  // Fetch product items for a selected version
  const fetchProductItems = async (versionId: string, productListDetailsId?: number) => {
    try {
      setIsLoadingItems(true);

      // Find the version in the versions array to get the productListDetailsId if not provided
      if (!productListDetailsId) {
        const selectedVersion = versions.find(v => v.id === versionId);
        if (!selectedVersion || !selectedVersion.productListDetailsId) {
          throw new Error("Product list details ID not found for this version");
        }
        productListDetailsId = selectedVersion.productListDetailsId;
      }

      const response = await apiClient.get<ApiResponse<Array<{
        id: number;
        shopName: string;
        itemId: number;
        quantity: number;
        unit: string;
        productListDetailsId: number;
        itemName: string;
        unitPrice: number;
        sellingPrice: number;
      }>>>(
        `company/${companyId}/productListItems/${productListDetailsId}`
      );

      // Map the API response to the ProductItem interface
      const mappedItems: ProductItem[] = response.payload.map(item => ({
        id: item.id.toString(),
        productName: item.itemName,
        qtyOrdered: item.quantity,
        qtyActual: item.quantity, // Using the same value for qtyActual as we don't have this in the API response FIXME:
        notes: `${item.unit}`, // Using unit as notes FIXME: Wrong obviously
        unitPrice: item.unitPrice,
        sellingPrice: item.sellingPrice
      }));

      // Set the product items
      setProductItems(mappedItems || []);

      // Add to viewed versions
      setViewedVersions(prev => {
            const next = new Set(prev);
            next.add(versionId);
            return next;
          });
    } catch (error) {
      console.error("Failed to fetch product items:", error);
      // Treat all errors as "no products" cases
      setProductItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSelectStep = (stepType: string, versionId: string) => {
    setSelectedStepType(stepType);
    setSelectedVersionId(versionId);

    // Find the version in the version array to get the productListDetailsId
    const selectedVersion = versions.find(v => v.id === versionId);
    if (selectedVersion && selectedVersion.productListDetailsId) {
      fetchProductItems(versionId, selectedVersion.productListDetailsId);
    } else {
      fetchProductItems(versionId);
    }
  };

  const handleCompareVersions = () => {
    router.push(`/shops/${shopId}/deliveries/${date}/compare`);
  };

  if (isLoadingVersions) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading delivery versions...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No delivery versions found for this date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Delivery Versions - {date}</h2>
        <Button
          onClick={handleCompareVersions}
          disabled={viewedVersions.size < 2}
        >
          Compare Versions
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <StepTimeline
            steps={versions}
            selectedStepType={selectedStepType}
            onSelectStep={handleSelectStep}
            groupedSteps={groupedVersions}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <VersionList 
          items={productItems} 
          isLoading={isLoadingItems}
          showExportAsCsvFile={'Complete Delivery' == 'Complete Delivery'}
          shopId={shopId}
          date={date}
          companyId={companyId}
        />
      </div>
    </div>
  );
}
