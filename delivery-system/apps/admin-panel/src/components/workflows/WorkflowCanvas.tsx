"use client";

import { Workflow, WorkflowStep } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  workflow: Workflow | null;
  selectedStepId: string | null;
  onStepSelect: (stepId: string | null) => void;
  onStepDelete?: (stepId: string) => void;
  onStepAdd?: (afterStepId: string) => void;
  onStepReorder?: (stepIds: string[]) => void;
  className?: string;
}

export default function WorkflowCanvas({
  workflow,
  selectedStepId,
  onStepSelect,
  onStepDelete,
  onStepAdd,
  onStepReorder,
  className,
}: WorkflowCanvasProps) {
  if (!workflow) {
    return (
      <div
        className={cn(
          "bg-white border rounded-lg p-8 flex items-center justify-center",
          className,
        )}
      >
        <div className="text-center text-muted-foreground">
          <p>No workflow data available</p>
        </div>
      </div>
    );
  }

  const handleStepClick = (stepId: string) => {
    onStepSelect(selectedStepId === stepId ? null : stepId);
  };

  const handleStepDelete = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStepDelete) {
      onStepDelete(stepId);
    }
  };

  const handleStepAdd = (afterStepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStepAdd) {
      onStepAdd(afterStepId);
    }
  };

  const getConnectionBottleneck = (fromStepId: string, toStepId: string) => {
    return workflow.connections.find(
      (conn) => conn.fromStepId === fromStepId && conn.toStepId === toStepId,
    )?.isBottleneck;
  };

  return (
    <div
      className={cn("bg-white border rounded-lg p-6 overflow-auto", className)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{workflow.name}</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop to reorder steps • Click steps to edit
        </p>
      </div>

      <div className="relative min-h-[400px] bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2 flex-wrap">
          {workflow.steps.map((step, index) => {
            const isSelected = selectedStepId === step.id;
            const isStartOrEnd = step.id === "start" || step.id === "end";
            const nextStep = workflow.steps[index + 1];
            const hasBottleneck =
              nextStep && getConnectionBottleneck(step.id, nextStep.id);
            const canDelete = !isStartOrEnd && workflow.steps.length > 3; // Keep at least start + 1 step + end

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "relative cursor-pointer transition-all duration-200 hover:scale-105 group",
                    isSelected && "scale-110",
                  )}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div
                    className={cn(
                      "min-w-[120px] p-4 rounded-lg border-2 text-center relative",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    )}
                    style={{
                      borderColor: isSelected ? undefined : step.color + "40",
                      backgroundColor: isSelected
                        ? undefined
                        : step.color + "10",
                    }}
                  >
                    <Badge
                      className="mb-2"
                      style={{ backgroundColor: step.color, color: "white" }}
                    >
                      {isStartOrEnd ? step.name : `${index}. ${step.name}`}
                    </Badge>

                    {!isStartOrEnd && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Avg: {step.stats.avgTime}min</div>
                        <div>Success: {step.stats.successRate}%</div>
                      </div>
                    )}

                    {/* Delete button */}
                    {canDelete && (
                      <button
                        onClick={(e) => handleStepDelete(step.id, e)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete step"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    )}

                    {step.notifications.shopAssistant && (
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">S</span>
                      </div>
                    )}

                    {step.notifications.customerSms && (
                      <div
                        className={cn(
                          "absolute -top-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center",
                          step.notifications.shopAssistant
                            ? "-left-8"
                            : "-left-2",
                        )}
                      >
                        <span className="text-xs text-white font-bold">C</span>
                      </div>
                    )}
                  </div>
                </div>

                {nextStep && (
                  <div className="flex items-center mx-1">
                    {hasBottleneck && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                    )}
                    <ArrowRight
                      className={cn(
                        "h-4 w-4",
                        hasBottleneck ? "text-amber-500" : "text-gray-400",
                      )}
                    />
                    {hasBottleneck && (
                      <span className="text-xs text-amber-600 ml-1">
                        {
                          workflow.connections.find(
                            (conn) =>
                              conn.fromStepId === step.id &&
                              conn.toStepId === nextStep.id,
                          )?.avgTransitionTime
                        }
                        min
                      </span>
                    )}

                    {/* Add step button */}
                    {onStepAdd &&
                      step.id !== "end" &&
                      nextStep.id !== "end" && (
                        <button
                          onClick={(e) => handleStepAdd(step.id, e)}
                          className="ml-1 w-6 h-6 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
                          title="Add step after this one"
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </button>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Shop Assistant</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Customer SMS</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
              <span>Bottleneck</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
