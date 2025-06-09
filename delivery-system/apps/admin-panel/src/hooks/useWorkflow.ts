// delivery-system/apps/admin-panel/src/hooks/useWorkflow.ts
import { useState, useCallback, useMemo } from 'react';
import {
  useWorkflowConfiguration,
  useWorkflowConfigMutations
} from '@delivery-system/hooks';
import {
  WorkflowUI,
  WorkflowStats,
  WorkflowStepUI,
  WorkflowConnection
} from '@delivery-system/types';

// Admin-specific color palette for steps
const ADMIN_STEP_COLORS = [
  '#10b981', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#6366f1', // Indigo
];

/**
 * Admin panel specific workflow hook that adds visual/UI enhancements
 * This builds on top of the shared configuration hook
 */
export function useWorkflow(companyId: string, shopId?: string) {
  const companyIdNum = parseInt(companyId) || 0;
  const shopIdNum = shopId ? parseInt(shopId) : undefined;

  // Local state for optimistic updates
  const [localWorkflow, setLocalWorkflow] = useState<WorkflowUI | null>(null);

  // Use shared configuration hook
  const {
    steps,
    loading,
    error,
    refetch
  } = useWorkflowConfiguration({
    companyId: companyIdNum,
    shopId: shopIdNum
  });

  // Transform steps into full WorkflowUI with admin-specific enhancements
  const workflow: WorkflowUI | null = useMemo(() => {
    if (!steps || steps.length === 0) return null;

    // Apply local updates if any
    const workflowSteps = localWorkflow?.steps || steps;

    // Generate admin-specific visual enhancements
    const enhancedSteps = workflowSteps.map((step, index) => ({
      ...step,
      meta: {
        ...step.meta,
        // Add color if not set
        color: step.meta.color || getAdminStepColor(index, workflowSteps.length),
        // Generate position if not set
        position: step.meta.position || {
          x: 150 + (index * 200),
          y: 200
        },
        // Set default notifications if not set
        notifications: step.meta.notifications || {
          shopAssistant: index > 0 && index < workflowSteps.length - 1,
          customerSms: index === 0 || index === workflowSteps.length - 1
        },
        // Set default stats if not set
        stats: step.meta.stats || {
          avgTime: index === 0 ? 0 : 15 + (index * 5),
          successRate: 95 - (index * 2)
        }
      }
    }));

    // Generate visual connections for the admin canvas
    const connections = generateVisualConnections(enhancedSteps);

    return {
      id: companyIdNum,
      companyId: companyIdNum,
      shopId: shopIdNum,
      name: shopId ? `Shop ${shopId} Workflow` : 'Company Workflow',
      steps: enhancedSteps,
      connections,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [steps, localWorkflow, companyIdNum, shopIdNum, shopId]);

  // Calculate admin-specific stats for visualization
  const stats = useMemo(() => {
    if (!workflow) return null;
    return calculateAdminWorkflowStats(workflow);
  }, [workflow]);

  // Local state updater for optimistic updates
  const updateWorkflowState = useCallback((updatedWorkflow: WorkflowUI) => {
    setLocalWorkflow(updatedWorkflow);
  }, []);

  // Reset local state on refetch
  const enhancedRefetch = useCallback(async () => {
    setLocalWorkflow(null);
    await refetch();
  }, [refetch]);

  return {
    workflow,
    stats,
    loading,
    error,
    updateWorkflowState,
    refetch: enhancedRefetch
  };
}

// Admin-specific helper functions for visual enhancements

function getAdminStepColor(index: number, total: number): string {
  // Special colors for start and end
  if (index === 0 || index === total - 1) {
    return '#10b981'; // Green for start/end
  }

  // Cycle through admin colors for middle steps
  return ADMIN_STEP_COLORS[index % ADMIN_STEP_COLORS.length];
}

function generateVisualConnections(steps: WorkflowStepUI[]): WorkflowConnection[] {
  const connections: WorkflowConnection[] = [];

  for (let i = 0; i < steps.length - 1; i++) {
    connections.push({
      id: `conn-${i}`,
      fromStepId: steps[i].id,
      toStepId: steps[i + 1].id,
      avgTransitionTime: 10 + (i * 5),
      // Mark middle step as bottleneck for demo purposes
      isBottleneck: i === Math.floor(steps.length / 2)
    });
  }

  return connections;
}

function calculateAdminWorkflowStats(workflow: WorkflowUI): WorkflowStats {
  const avgCompletionTime = workflow.steps.reduce(
      (sum, step) => sum + (step.meta.stats?.avgTime || 0),
      0
  );

  const successRate = workflow.steps.length > 0
      ? workflow.steps.reduce((sum, step) => sum + (step.meta.stats?.successRate || 95), 0) / workflow.steps.length
      : 0;

  // For admin panel, identify visual bottlenecks
  const bottleneckStep = workflow.steps.find((_, index) =>
      index === Math.floor(workflow.steps.length / 2)
  );

  return {
    totalWorkflows: 1,
    avgCompletionTime,
    successRate,
    bottlenecks: bottleneckStep ? [{
      stepId: bottleneckStep.id,
      stepName: bottleneckStep.customName,
      avgDelay: 15
    }] : []
  };
}

// Extended mutations hook with admin-specific features
export function useWorkflowMutations(workflowId?: number) {
  const companyId = workflowId || 0; // For now, using workflowId as companyId
  const sharedMutations = useWorkflowConfigMutations(companyId);

  // Admin-specific wrapper for updateStep with additional validation
  const updateStep = useCallback(async (
      stepId: number,
      updates: Partial<WorkflowStepUI>
  ) => {
    // Admin-specific validation
    if (updates.customName && updates.customName.length > 50) {
      throw new Error('Step name must be less than 50 characters');
    }

    await sharedMutations.updateStep(stepId, updates);
  }, [sharedMutations]);

  // Admin-specific wrapper for addStep with default values
  const addStep = useCallback(async (
      afterStepId: number,
      step?: Partial<Omit<WorkflowStepUI, 'id'>>
  ) => {
    // Apply admin defaults
    const defaultStep: Omit<WorkflowStepUI, 'id'> = {
      stepKey: `step_${Date.now()}`,
      customName: 'New Step',
      order: 0, // Will be set by backend
      metaJson: null,
      meta: {
        color: '#6366f1',
        position: { x: 0, y: 0 }, // Will be recalculated
        notifications: {
          shopAssistant: false,
          customerSms: false
        },
        stats: {
          avgTime: 15,
          successRate: 95
        },
        ...step?.meta
      },
      ...step
    };

    return await sharedMutations.addStep(afterStepId, defaultStep);
  }, [sharedMutations]);

  return {
    ...sharedMutations,
    updateStep,
    addStep
  };
}

// Hook for managing workflow selection in admin panel
export function useWorkflowSelection(isAdmin: boolean, userCompanyId?: number) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
      !isAdmin && userCompanyId ? userCompanyId.toString() : ''
  );
  const [selectedShopId, setSelectedShopId] = useState<string | undefined>(undefined);

  const handleWorkflowChange = useCallback((companyId: string, shopId?: string) => {
    setSelectedCompanyId(companyId);
    setSelectedShopId(shopId);
  }, []);

  return {
    selectedCompanyId,
    selectedShopId,
    handleWorkflowChange
  };
}