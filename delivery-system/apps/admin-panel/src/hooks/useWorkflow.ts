import { useState, useEffect } from "react";
import {
  Workflow,
  WorkflowStats,
  WorkflowMutations,
  WorkflowStep,
} from "@/types/workflow";

// Mock workflow data
const mockWorkflow: Workflow = {
  id: "workflow-1",
  companyId: "company-1",
  name: "Standard Delivery Workflow",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
  steps: [
    {
      id: "start",
      name: "Start",
      color: "#10b981",
      position: { x: 50, y: 200 },
      notifications: { shopAssistant: false, customerSms: false },
      stats: { avgTime: 0, successRate: 100 },
    },
    {
      id: "step-1",
      name: "Order Received",
      color: "#3b82f6",
      position: { x: 200, y: 200 },
      notifications: { shopAssistant: true, customerSms: true },
      stats: { avgTime: 5, successRate: 98.5 },
    },
    {
      id: "step-2",
      name: "Preparation",
      color: "#f59e0b",
      position: { x: 350, y: 200 },
      notifications: { shopAssistant: true, customerSms: false },
      stats: { avgTime: 25, successRate: 95.2 },
    },
    {
      id: "step-3",
      name: "Ready for Pickup",
      color: "#8b5cf6",
      position: { x: 500, y: 200 },
      notifications: { shopAssistant: true, customerSms: true },
      stats: { avgTime: 45, successRate: 92.8 },
    },
    {
      id: "step-4",
      name: "Out for Delivery",
      color: "#ef4444",
      position: { x: 650, y: 200 },
      notifications: { shopAssistant: false, customerSms: true },
      stats: { avgTime: 30, successRate: 97.1 },
    },
    {
      id: "end",
      name: "Delivered",
      color: "#10b981",
      position: { x: 800, y: 200 },
      notifications: { shopAssistant: false, customerSms: true },
      stats: { avgTime: 0, successRate: 100 },
    },
  ],
  connections: [
    {
      id: "conn-1",
      fromStepId: "start",
      toStepId: "step-1",
      avgTransitionTime: 2,
      isBottleneck: false,
    },
    {
      id: "conn-2",
      fromStepId: "step-1",
      toStepId: "step-2",
      avgTransitionTime: 8,
      isBottleneck: false,
    },
    {
      id: "conn-3",
      fromStepId: "step-2",
      toStepId: "step-3",
      avgTransitionTime: 15,
      isBottleneck: true,
    },
    {
      id: "conn-4",
      fromStepId: "step-3",
      toStepId: "step-4",
      avgTransitionTime: 12,
      isBottleneck: false,
    },
    {
      id: "conn-5",
      fromStepId: "step-4",
      toStepId: "end",
      avgTransitionTime: 5,
      isBottleneck: false,
    },
  ],
};

const mockStats: WorkflowStats = {
  totalWorkflows: 1,
  avgCompletionTime: 105,
  successRate: 94.7,
  bottlenecks: [
    {
      stepId: "step-3",
      stepName: "Ready for Pickup",
      avgDelay: 15,
    },
  ],
};

export function useWorkflow(companyId: string, shopId?: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Create a copy of the workflow with shop-specific modifications if needed
      const workflowCopy = {
        ...mockWorkflow,
        name: shopId
          ? `${mockWorkflow.name} - Shop Specific`
          : mockWorkflow.name,
        id: shopId ? `${mockWorkflow.id}-${shopId}` : mockWorkflow.id,
      };

      setWorkflow(workflowCopy);
      setStats(mockStats);
      setLoading(false);
    }, 500);
  }, [companyId, shopId]);

  const updateWorkflowState = (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  };

  return { workflow, stats, loading, error, updateWorkflowState };
}

export function useWorkflowMutations(): WorkflowMutations & {
  loading: boolean;
} {
  const [loading, setLoading] = useState(false);

  const updateWorkflow = async (workflow: Partial<Workflow>) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const updateStep = async (stepId: string, step: Partial<WorkflowStep>) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    return step;
  };

  const addStep = async (
    step: Omit<WorkflowStep, "id">,
    insertAfterStepId?: string,
  ) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    return { ...step, id: `step-${Date.now()}` };
  };

  const removeStep = async (stepId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  };

  const reorderSteps = async (stepIds: string[]) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  };

  return {
    updateWorkflow,
    updateStep,
    addStep,
    removeStep,
    reorderSteps,
    loading,
  };
}
