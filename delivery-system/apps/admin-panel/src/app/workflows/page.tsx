//delivery-system/apps/admin-panel/src/app/workflows/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkflow, useWorkflowMutations } from "@/hooks/useWorkflow";
import { WorkflowStepUI, WorkflowUI } from "@delivery-system/types";
import WorkflowCanvas from "@/components/workflows/WorkflowCanvas";
import StepInspector from "@/components/workflows/StepInspector";
import WorkflowStatsCard from "@/components/workflows/WorkflowStatsCard";
import WorkflowSelector from "@/components/workflows/WorkflowSelector";
import CompanySelector from "@/components/templates/CompanySelector";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Save, RefreshCw } from "lucide-react";
import { getCompanyId } from "@delivery-system/api-client";

export default function WorkflowsPage() {
  // Use the new auth hook
  const { isAdmin, isManager } = useAuth();
  const userCompanyId = getCompanyId();

  // Initialize company selection based on user role
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
      isManager && userCompanyId ? userCompanyId.toString() : ""
  );
  const [selectedShopId, setSelectedShopId] = useState<string | undefined>(
      undefined,
  );
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  const {
    workflow,
    stats,
    loading: workflowLoading,
    updateWorkflowState,
  } = useWorkflow(selectedCompanyId, selectedShopId);

  const {
    updateStep,
    addStep,
    removeStep,
    reorderSteps,
    loading: mutationLoading,
  } = useWorkflowMutations(workflow?.id);

  // Check authorization
  if (!isAdmin && !isManager) {
    return (
        <ForbiddenPage
            title="Access Denied"
            description="You don't have permission to access the workflows page. Only Admins and Managers can configure delivery workflows."
        />
    );
  }

  const handleWorkflowChange = (companyId: string, shopId?: string) => {
    setSelectedCompanyId(companyId);
    setSelectedShopId(shopId);
    setSelectedStepId(null); // Reset selection when switching workflows
  };

  const handleStepSave = async (
      stepId: number,
      updates: Partial<WorkflowStepUI>,
  ) => {
    await updateStep(stepId, updates);
    // Update local state immediately
    if (workflow) {
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step,
        ),
      };
      updateWorkflowState(updatedWorkflow);
    }
  };

  const handleRealTimeUpdate = (
      stepId: number,
      updates: Partial<WorkflowStepUI>,
  ) => {
    if (workflow) {
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step,
        ),
      };
      updateWorkflowState(updatedWorkflow);
    }
  };

  const handleStepDelete = async (stepId: number) => {
    if (!workflow) return;

    await removeStep(stepId);
    const updatedWorkflow = {
      ...workflow,
      steps: workflow.steps.filter((step) => step.id !== stepId),
      connections: workflow.connections?.filter(
          (conn) => conn.fromStepId !== stepId && conn.toStepId !== stepId,
      ) || [],
    };
    updateWorkflowState(updatedWorkflow);

    // Clear selection if deleted step was selected
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  };

  const handleStepAdd = async (afterStepId: number) => {
    if (!workflow) return;

    const afterIndex = workflow.steps.findIndex(
        (step) => step.id === afterStepId,
    );

    // Create new step data
    const newStepData: Omit<WorkflowStepUI, 'id'> = {
      stepKey: `step_${Date.now()}`,
      customName: "New Step",
      order: afterIndex + 1,
      metaJson: null,
      meta: {
        color: "#6366f1",
        position: { x: 0, y: 0 },
        notifications: { shopAssistant: false, customerSms: false },
        stats: { avgTime: 15, successRate: 95 },
      }
    };

    const newStep = await addStep(afterStepId, newStepData);

    const updatedSteps = [...workflow.steps];
    updatedSteps.splice(afterIndex + 1, 0, newStep);

    const updatedWorkflow = {
      ...workflow,
      steps: updatedSteps,
    };
    updateWorkflowState(updatedWorkflow);
  };

  const handleStepReorder = async (stepIds: number[]) => {
    if (!workflow) return;

    await reorderSteps(stepIds);
    const reorderedSteps = stepIds
        .map((id) => workflow.steps.find((step) => step.id === id)!)
        .filter(Boolean);

    const updatedWorkflow = {
      ...workflow,
      steps: reorderedSteps,
    };
    updateWorkflowState(updatedWorkflow);
  };

  const selectedStep =
      workflow?.steps.find((step) => step.id === selectedStepId) || null;

  return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                Workflow Configuration
              </h1>
            </div>
            <p className="text-gray-600">
              Configure delivery workflows with drag-and-drop visual editor
            </p>
          </div>

          {/* Company Selector for Admins */}
          {isAdmin && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompanySelector
                      selectedCompanyId={selectedCompanyId}
                      onCompanyChange={(companyId) => handleWorkflowChange(companyId)}
                  />
                </CardContent>
              </Card>
          )}

          {/* Workflow Selector */}
          {selectedCompanyId && (
              <WorkflowSelector
                  selectedCompanyId={selectedCompanyId}
                  selectedShopId={selectedShopId}
                  onWorkflowChange={handleWorkflowChange}
                  className="mb-6"
              />
          )}

          {/* Main Content */}
          {selectedCompanyId ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Workflow Canvas */}
                <div className="xl:col-span-2 space-y-6">
                  <WorkflowCanvas
                      workflow={workflow}
                      selectedStepId={selectedStepId}
                      onStepSelect={setSelectedStepId}
                      onStepDelete={handleStepDelete}
                      onStepAdd={handleStepAdd}
                      onStepReorder={handleStepReorder}
                      className="min-h-[500px]"
                  />

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                        disabled={mutationLoading || workflowLoading}
                        className="flex items-center gap-2"
                    >
                      {mutationLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                          <Save className="h-4 w-4" />
                      )}
                      Save Draft
                    </Button>
                  </div>
                </div>

                {/* Right Column - Inspector & Stats */}
                <div className="space-y-6">
                  <StepInspector
                      step={selectedStep}
                      onSave={handleStepSave}
                      onRealTimeUpdate={handleRealTimeUpdate}
                      loading={mutationLoading}
                      className="min-h-[400px]"
                  />

                  <WorkflowStatsCard stats={stats} />
                </div>
              </div>
          ) : (
              isAdmin && (
                  <Card className="bg-white">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">
                        Select a company to configure its workflow
                      </p>
                    </CardContent>
                  </Card>
              )
          )}
        </div>
      </div>
  );
}