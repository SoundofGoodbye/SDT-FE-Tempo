import { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import { ProductListVersionModel, ProductListItemModel, WorkflowStepModel } from "@/types/delivery";
import {
    ProductListItem,
    mapProductListItemToProductItem,
    ProductItem
} from '@/types/delivery-workflow';

export interface WorkflowStep {
    id: number;
    stepKey: string;
    customName: string;
    order: number;
    metaJson?: string;
}

export interface UseDeliveryWorkflowResult {
    // Existing properties - keeping them all
    initialVersion: ProductListVersionModel | null;
    currentVersion: ProductListVersionModel | null;
    productListDetailsNumber: string | null;
    workflowSteps: WorkflowStep[];
    currentStep: WorkflowStep | null;
    isFinalStep: boolean;
    advanceStep: (
        description: string,
        itemUpdates: { id: number; quantity: number }[]
    ) => Promise<ProductListItemModel[]>;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;

    // New properties we're adding
    versions: ProductListVersionModel[];  // Expose all versions
    latestVersion: ProductListVersionModel | null;  // Explicit latest version
    isFirstStep: boolean;
    nextStep: WorkflowStep | null;
    previousStep: WorkflowStep | null;
    fetchProductItems: (productListDetailsId: number) => Promise<ProductItem[]>;

    // Separate loading states for granular control
    workflowLoading: boolean;
    versionsLoading: boolean;

    // Separate error states
    workflowError: string | null;
    versionsError: string | null;
}

export function useDeliveryWorkflow(
    companyId: number,
    shopId: number,
    date: string
): UseDeliveryWorkflowResult {
    // Keep all existing state
    const [versions, setVersions] = useState<ProductListVersionModel[]>([]);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [initialVersion, setInitialVersion] = useState<ProductListVersionModel | null>(null);
    const [currentVersion, setCurrentVersion] = useState<ProductListVersionModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Add new loading/error states for granular control
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [workflowError, setWorkflowError] = useState<string | null>(null);
    const [versionsError, setVersionsError] = useState<string | null>(null);

    // Keep the existing effect with minor enhancements
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setWorkflowLoading(true);
            setVersionsLoading(true);

            try {
                const versionRes = await apiClient.get<ApiResponse<ProductListVersionModel[]>>(
                    `company/${companyId}/productList?shopId=${shopId}&date=${date}`
                );

                const versionList = versionRes.payload || [];
                setVersions(versionList);
                setVersionsLoading(false);
                setVersionsError(null);

                if (versionList.length > 0) {
                    const sorted = [...versionList].sort(
                        (a, b) => (a.workflowStepOrder ?? 99) - (b.workflowStepOrder ?? 99)
                    );
                    setInitialVersion(sorted[0]);
                    setCurrentVersion(sorted[sorted.length - 1]);

                    const workflowRes = await apiClient.get<ApiResponse<WorkflowStepModel[]>>(
                        `company/${companyId}/workflow?shopId=${shopId}`
                    );
                    const workflowSteps = workflowRes.payload;
                    setWorkflowSteps(workflowSteps);
                    setWorkflowLoading(false);
                    setWorkflowError(null);
                }
            } catch (e: any) {
                const message = e.message || "Failed to load workflow or versions";
                setError(message);
                console.error(e);

                // Set specific errors
                if (e.message?.includes('workflow')) {
                    setWorkflowError(message);
                } else {
                    setVersionsError(message);
                }
            } finally {
                setLoading(false);
                setWorkflowLoading(false);
                setVersionsLoading(false);
            }
        };

        fetchData();
    }, [companyId, shopId, date]);

    // Keep existing computed value
    const currentStep = workflowSteps.find(
        s => s.id === currentVersion?.workflowStepId
    ) || null;

    // Keep existing computed value
    const isFinalStep = currentStep?.id === workflowSteps[workflowSteps.length - 1]?.id;

    // Add new computed values
    const latestVersion = useMemo(() => {
        if (versions.length === 0) return null;
        const sorted = [...versions].sort(
            (a, b) => (a.workflowStepOrder ?? 99) - (b.workflowStepOrder ?? 99)
        );
        return sorted[sorted.length - 1];
    }, [versions]);

    const isFirstStep = useMemo(() => {
        if (!currentStep || workflowSteps.length === 0) return false;
        return currentStep.id === workflowSteps[0].id;
    }, [currentStep, workflowSteps]);

    const nextStep = useMemo(() => {
        if (!currentStep || workflowSteps.length === 0) return null;
        const currentIndex = workflowSteps.findIndex(step => step.id === currentStep.id);
        if (currentIndex === -1 || currentIndex === workflowSteps.length - 1) return null;
        return workflowSteps[currentIndex + 1];
    }, [currentStep, workflowSteps]);

    const previousStep = useMemo(() => {
        if (!currentStep || workflowSteps.length === 0) return null;
        const currentIndex = workflowSteps.findIndex(step => step.id === currentStep.id);
        if (currentIndex <= 0) return null;
        return workflowSteps[currentIndex - 1];
    }, [currentStep, workflowSteps]);

    // Keep existing advanceStep exactly as is
    const advanceStep = async (
        description: string,
        itemUpdates: { id: number; quantity: number }[]
    ): Promise<ProductListItemModel[]> => {
        if (!currentVersion) throw new Error("No current version to advance");

        console.log("advanceStep called with:", { description, itemUpdates });

        const resp = await apiClient.post<ApiResponse<ProductListItemModel[]>>(
            `/company/${companyId}/productList/${currentVersion.productListDetailsId}/advanceStep`,
            { description, itemUpdates }
        );

        return resp.payload || [];
    };

    // Add new fetchProductItems method
    const fetchProductItems = useCallback(async (productListDetailsId: number): Promise<ProductItem[]> => {
        try {
            const response = await apiClient.get<ApiResponse<ProductListItem[]>>(
                `company/${companyId}/productListItems/${productListDetailsId}`
            );

            if (response?.payload) {
                return response.payload.map(mapProductListItemToProductItem);
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch product items:', error);
            throw error;
        }
    }, [companyId]);

    // Keep existing refetch with enhancements
    const refetch = async () => {
        setLoading(true);
        setError(null);
        setWorkflowLoading(true);
        setVersionsLoading(true);

        try {
            const [versionRes, workflowRes] = await Promise.all([
                apiClient.get<ApiResponse<ProductListVersionModel[]>>(
                    `company/${companyId}/productList?shopId=${shopId}&date=${date}`
                ),
                apiClient.get<ApiResponse<WorkflowStepModel[]>>(
                    `company/${companyId}/workflow?shopId=${shopId}`
                )
            ]);

            const versionList = versionRes.payload || [];
            const workflowStepsList = workflowRes.payload || [];

            setVersions(versionList);
            setWorkflowSteps(workflowStepsList);

            const sorted = [...versionList].sort((a, b) => (a.workflowStepOrder ?? 99) - (b.workflowStepOrder ?? 99));
            setInitialVersion(sorted[0]);
            setCurrentVersion(sorted[sorted.length - 1]);

            setVersionsError(null);
            setWorkflowError(null);
        } catch (e: any) {
            const message = e.message || "Failed to refresh workflow or versions";
            setError(message);
            console.error(e);
        } finally {
            setLoading(false);
            setWorkflowLoading(false);
            setVersionsLoading(false);
        }
    };

    return {
        // All existing properties
        initialVersion,
        currentVersion,
        productListDetailsNumber: versions?.[0]?.productListDetailsNumber || null,
        workflowSteps,
        currentStep,
        isFinalStep,
        advanceStep,
        loading,
        error,
        refetch,

        // New properties
        versions,
        latestVersion,
        isFirstStep,
        nextStep,
        previousStep,
        fetchProductItems,
        workflowLoading,
        versionsLoading,
        workflowError,
        versionsError
    };
}