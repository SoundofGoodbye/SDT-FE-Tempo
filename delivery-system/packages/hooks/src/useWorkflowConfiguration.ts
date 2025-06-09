import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@delivery-system/api-client';
import {
    WorkflowStep,
    WorkflowStepUI,
    WorkflowStepsResponse,
    toWorkflowStepUI,
    fromWorkflowStepUI
} from '@delivery-system/types';

export interface UseWorkflowConfigurationOptions {
    companyId: number;
    shopId?: number;
}

export interface UseWorkflowConfigurationResult {
    steps: WorkflowStepUI[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for fetching workflow configuration (steps structure)
 * Used by admin panel for workflow configuration
 */
export function useWorkflowConfiguration({
                                             companyId,
                                             shopId
                                         }: UseWorkflowConfigurationOptions): UseWorkflowConfigurationResult {
    const [steps, setSteps] = useState<WorkflowStepUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflowSteps = useCallback(async () => {
        if (!companyId) return;

        setLoading(true);
        setError(null);

        try {
            const endpoint = shopId
                ? `company/${companyId}/workflow?shopId=${shopId}`
                : `company/${companyId}/workflow`;

            const response = await apiClient.get<WorkflowStepsResponse>(endpoint);

            if (response.payload) {
                // Convert to UI format
                const uiSteps = response.payload.map(toWorkflowStepUI);
                setSteps(uiSteps);
            }
        } catch (err: any) {
            console.error('Failed to fetch workflow steps:', err);
            setError(err.message || 'Failed to load workflow steps');
        } finally {
            setLoading(false);
        }
    }, [companyId, shopId]);

    useEffect(() => {
        fetchWorkflowSteps();
    }, [fetchWorkflowSteps]);

    return {
        steps,
        loading,
        error,
        refetch: fetchWorkflowSteps
    };
}

/**
 * Hook for workflow mutations (create, update, delete steps)
 * These will need to be implemented in the backend
 */
export interface UseWorkflowConfigMutationsResult {
    updateStep: (stepId: number, updates: Partial<WorkflowStepUI>) => Promise<void>;
    addStep: (afterStepId: number, step: Omit<WorkflowStepUI, 'id'>) => Promise<WorkflowStepUI>;
    removeStep: (stepId: number) => Promise<void>;
    reorderSteps: (stepIds: number[]) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export function useWorkflowConfigMutations(
    companyId: number,
    shopId?: number
): UseWorkflowConfigMutationsResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateStep = useCallback(async (
        stepId: number,
        updates: Partial<WorkflowStepUI>
    ) => {
        setLoading(true);
        setError(null);

        try {
            // Convert UI step to backend format
            const backendUpdates = {
                customName: updates.customName,
                metaJson: updates.meta ? JSON.stringify(updates.meta) : undefined
            };

            // TODO: Implement in backend
            await apiClient.put(
                `company/${companyId}/workflow/steps/${stepId}`,
                backendUpdates
            );
        } catch (err: any) {
            setError(err.message || 'Failed to update step');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const addStep = useCallback(async (
        afterStepId: number,
        step: Omit<WorkflowStepUI, 'id'>
    ): Promise<WorkflowStepUI> => {
        setLoading(true);
        setError(null);

        try {
            const backendStep = fromWorkflowStepUI({ ...step, id: 0 } as WorkflowStepUI);

            // TODO: Implement in backend
            const response = await apiClient.post<ApiResponse<WorkflowStep>>(
                `company/${companyId}/workflow/steps`,
                {
                    ...backendStep,
                    afterStepId
                }
            );

            return toWorkflowStepUI(response.payload);
        } catch (err: any) {
            setError(err.message || 'Failed to add step');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const removeStep = useCallback(async (stepId: number) => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Implement in backend
            await apiClient.delete(`company/${companyId}/workflow/steps/${stepId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to remove step');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const reorderSteps = useCallback(async (stepIds: number[]) => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Implement in backend
            await apiClient.put(
                `company/${companyId}/workflow/steps/reorder`,
                { stepIds }
            );
        } catch (err: any) {
            setError(err.message || 'Failed to reorder steps');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    return {
        updateStep,
        addStep,
        removeStep,
        reorderSteps,
        loading,
        error
    };
}