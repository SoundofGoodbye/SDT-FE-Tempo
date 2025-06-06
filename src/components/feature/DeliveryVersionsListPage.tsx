"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepTimeline } from "../ui/StepTimeline";
import { VersionList } from "./VersionList";
import { useDeliveryWorkflow } from "@/hooks/useDeliveryWorkflow";
import { ProductItem } from "@/types/delivery";

interface DeliveryVersionsListPageProps {
  shopId: string;
  date: string;
  companyId: string;
}

// Temporary type to maintain compatibility with StepTimeline
interface DeliveryStep {
  id: string;
  stepType: string;
  timestamp?: string;
  productListDetailsId?: number;
}

export default function DeliveryVersionsListPage({ shopId, date, companyId }: DeliveryVersionsListPageProps) {
  const router = useRouter();

  // Use the enhanced delivery workflow hook
  const {
    versions,
    latestVersion,
    fetchProductItems,
    versionsLoading,
    versionsError
  } = useDeliveryWorkflow(parseInt(companyId), parseInt(shopId), date);

  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [selectedStepType, setSelectedStepType] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);

  // Convert versions to DeliveryStep format for StepTimeline compatibility
  const deliverySteps: DeliveryStep[] = versions.map(version => ({
    id: version.versionId.toString(),
    stepType: version.deliveryStepName,
    timestamp: new Date().toISOString(), // Using current date as timestamp is not in API
    productListDetailsId: version.productListDetailsId,
  }));

  // Group versions by step type
  const groupedVersions = deliverySteps.reduce<Record<string, DeliveryStep[]>>((acc, version) => {
    if (!acc[version.stepType]) {
      acc[version.stepType] = [];
    }
    acc[version.stepType].push(version);
    return acc;
  }, {});

  // When versions are loaded, select the latest one
  useEffect(() => {
    if (latestVersion && !selectedVersionId) {
      setSelectedStepType(latestVersion.deliveryStepName);
      setSelectedVersionId(latestVersion.versionId.toString());

      // Fetch product items for the latest version
      handleFetchProductItems(latestVersion.productListDetailsId);
    }
  }, [latestVersion, selectedVersionId]);

  // Fetch product items for a selected version
  const handleFetchProductItems = async (productListDetailsId: number) => {
    try {
      setIsLoadingItems(true);
      const items = await fetchProductItems(productListDetailsId);
      setProductItems(items);
    } catch (error) {
      console.error("Failed to fetch product items:", error);
      setProductItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSelectStep = (stepType: string, versionId: string) => {
    setSelectedStepType(stepType);
    setSelectedVersionId(versionId);

    // Find the version to get the productListDetailsId
    const selectedVersion = versions.find(v => v.versionId.toString() === versionId);
    if (selectedVersion) {
      handleFetchProductItems(selectedVersion.productListDetailsId);
    }
  };

  if (versionsLoading) {
    return (
        <div className="px-4 py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading delivery versions...</p>
          </div>
        </div>
    );
  }

  if (versionsError) {
    return (
        <div className="px-4 py-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">Error: {versionsError}</p>
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
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <StepTimeline
                steps={deliverySteps}
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
              showExportAsCsvFile={false}
              shopId={shopId}
              date={date}
              companyId={companyId}
          />
        </div>
      </div>
  );
}