import { useEffect, useState } from "react";
import { apiClient, ApiResponse } from "@/lib/api/api-client";
import { ProductListVersionModel, ProductListItemModel, WorkflowStepModel } from "@/types/delivery";

export interface WorkflowStep {
    id: number;
    stepKey: string;
    customName: string;
    order: number;
    metaJson?: string;
}

export interface UseDeliveryWorkflowResult {
    initialVersion: ProductListVersionModel | null;
    currentVersion: ProductListVersionModel | null;
    workflowSteps: WorkflowStep[];
    currentStep: WorkflowStep | null;
    isFinalStep: boolean;
    advanceStep: (description: string, overrides: Record<number, number>) => Promise<ProductListItemModel[]>;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDeliveryWorkflow(
    companyId: number,
    shopId: number,
    date: string
): UseDeliveryWorkflowResult {
    const [versions, setVersions] = useState<ProductListVersionModel[]>([]);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [initialVersion, setInitialVersion] = useState<ProductListVersionModel | null>(null);
    const [currentVersion, setCurrentVersion] = useState<ProductListVersionModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const versionRes = await apiClient.get<ApiResponse<ProductListVersionModel[]>>(
                    `company/${companyId}/productList?shopId=${shopId}&date=${date}`
                );

                const versionList = versionRes.payload || [];
                setVersions(versionList);

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
                }
            } catch (e: any) {
                setError("Failed to load workflow or versions");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId, shopId, date]);




    const currentStep = workflowSteps.find(
        s => s.id === currentVersion?.workflowStepId
    ) || null;

    const isFinalStep = currentStep?.id === workflowSteps[workflowSteps.length - 1]?.id;

    const advanceStep = async (
        description: string,
        overrides: Record<number, number>
    ): Promise<ProductListItemModel[]> => {
        if (!currentVersion) throw new Error("No current version to advance");

        const itemUpdates = Object.entries(overrides)
            .filter(([_, qty]) => typeof qty === "number" && !isNaN(qty))
            .map(([id, qty]) => ({ id: +id, quantity: qty }));

        const resp = await apiClient.post<ApiResponse<ProductListItemModel[]>>(
            `/company/${companyId}/productList/${currentVersion.productListDetailsId}/onboard`,
            { description, itemUpdates }
        );

        return resp.payload || [];
    };

    const refetch = async () => {
        setLoading(true);
        setError(null);
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
            const workflowSteps = workflowRes.payload || [];

            setVersions(versionList);
            setWorkflowSteps(workflowSteps);

            const sorted = [...versionList].sort((a, b) => (a.workflowStepOrder ?? 99) - (b.workflowStepOrder ?? 99));
            setInitialVersion(sorted[0]);
            setCurrentVersion(sorted[sorted.length - 1]);
        } catch (e: any) {
            setError("Failed to refresh workflow or versions");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return {
        initialVersion,
        currentVersion,
        workflowSteps,
        currentStep,
        isFinalStep,
        advanceStep,
        loading,
        error,
        refetch
    };
}
