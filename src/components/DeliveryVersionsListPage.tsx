"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "./ui/button";
import { StepTimeline, DeliveryStep } from "./StepTimeline";
import { VersionList, ProductItem } from "./VersionList";

type ApiClient = {
  get: <T>(url: string) => Promise<T>;
};

// Mock API client - replace with your actual API client
const apiClient: ApiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }
};

export default function DeliveryVersionsListPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const date = params.date as string;
  const companyId = "1"; // Replace with actual company ID from context/auth

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
        const data = await apiClient.get<DeliveryStep[]>(
          `/api/company/${companyId}/productList?shopId=${shopId}&date=${date}`
        );
        
        // Sort versions by timestamp
        const sortedVersions = [...data].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setVersions(sortedVersions);
        
        // Select the first available step type
        if (sortedVersions.length > 0) {
          const firstStepType = sortedVersions[0].stepType;
          const firstVersionId = sortedVersions[0].id;
          setSelectedStepType(firstStepType);
          setSelectedVersionId(firstVersionId);
          fetchProductItems(firstVersionId);
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
  const fetchProductItems = async (versionId: string) => {
    try {
      setIsLoadingItems(true);
      const data = await apiClient.get<ProductItem[]>(
        `/api/company/${companyId}/productListItems/${versionId}`
      );
      setProductItems(data);
      
      // Add to viewed versions
      setViewedVersions(prev => new Set([...prev, versionId]));
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
    fetchProductItems(versionId);
  };

  const handleCompareVersions = () => {
    router.push(`/shops/${shopId}/deliveries/${date}/compare`);
  };

  if (isLoadingVersions) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading delivery versions...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No delivery versions found for this date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Delivery Versions - {date}</h2>
        <Button
          onClick={handleCompareVersions}
          disabled={viewedVersions.size < 2}
        >
          Compare Versions
        </Button>
      </div>

      <div className="mb-6">
        <StepTimeline
          steps={versions}
          selectedStepType={selectedStepType}
          onSelectStep={handleSelectStep}
          groupedSteps={groupedVersions}
        />
      </div>

      <VersionList 
        items={productItems} 
        isLoading={isLoadingItems} 
      />
    </div>
  );
}
