"use client";

import { useEffect, useState } from "react";
import { useWorkflow, useWorkflowMutations } from "@/hooks/useWorkflow";
import { WorkflowStep, Workflow } from "@/types/workflow";
import WorkflowCanvas from "@/components/workflows/WorkflowCanvas";
import StepInspector from "@/components/workflows/StepInspector";
import WorkflowStatsCard from "@/components/workflows/WorkflowStatsCard";
import WorkflowSelector from "@/components/workflows/WorkflowSelector";
import CompanySelector from "@/components/templates/CompanySelector";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Save, RefreshCw } from "lucide-react";

export default function WorkflowsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedShopId, setSelectedShopId] = useState<string | undefined>(
    undefined,
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  } = useWorkflowMutations();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const assignedCompanyId =
      localStorage.getItem("assignedCompanyId") || "company-1";

    setUserRole(role);

    // Auto-select company for managers
    if (role === "manager") {
      setSelectedCompanyId(assignedCompanyId);
    }

    setIsLoading(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authorization
  if (!userRole || (userRole !== "admin" && userRole !== "manager")) {
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
    stepId: string,
    updates: Partial<WorkflowStep>,
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
    stepId: string,
    updates: Partial<WorkflowStep>,
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

  const handleStepDelete = async (stepId: string) => {
    if (!workflow) return;

    await removeStep(stepId);
    const updatedWorkflow = {
      ...workflow,
      steps: workflow.steps.filter((step) => step.id !== stepId),
      connections: workflow.connections.filter(
        (conn) => conn.fromStepId !== stepId && conn.toStepId !== stepId,
      ),
    };
    updateWorkflowState(updatedWorkflow);

    // Clear selection if deleted step was selected
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  };

  const handleStepAdd = async (afterStepId: string) => {
    if (!workflow) return;

    const afterIndex = workflow.steps.findIndex(
      (step) => step.id === afterStepId,
    );
    const newStep = await addStep(
      {
        name: "New Step",
        color: "#6366f1",
        position: { x: 0, y: 0 },
        notifications: { shopAssistant: false, customerSms: false },
        stats: { avgTime: 15, successRate: 95 },
      },
      afterStepId,
    );

    const updatedSteps = [...workflow.steps];
    updatedSteps.splice(afterIndex + 1, 0, newStep);

    const updatedWorkflow = {
      ...workflow,
      steps: updatedSteps,
    };
    updateWorkflowState(updatedWorkflow);
  };

  const handleStepReorder = async (stepIds: string[]) => {
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
        {userRole === "admin" && (
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
          userRole === "admin" && (
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
