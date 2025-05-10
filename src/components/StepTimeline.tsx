import React from "react";
import { Badge } from "./ui/badge";

export type DeliveryStep = {
  id: string;
  stepType:
    | "Initial Request"
    | "On boarding"
    | "Add Stock"
    | "Remove Stock"
    | "Broken Product"
    | "Off Loading"
    | "Final";
  timestamp: string;
};

type StepTimelineProps = {
  steps: DeliveryStep[];
  selectedStepType: string | null;
  onSelectStep: (stepType: string, id: string) => void;
  groupedSteps: Record<string, DeliveryStep[]>;
};

export const StepTimeline: React.FC<StepTimelineProps> = ({
  steps = [],
  selectedStepType,
  onSelectStep,
  groupedSteps,
}) => {
  // All possible step types in order
  const allStepTypes = [
    "Initial Request",
    "On boarding",
    "Add Stock",
    "Remove Stock",
    "Broken Product",
    "Off Loading",
    "Final",
  ];

  const getStepVariant = (stepType: string) => {
    if (selectedStepType === stepType) return "default";
    if (groupedSteps[stepType]?.length > 0) return "outline";
    return "secondary";
  };

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Delivery Timeline</h3>
      <div className="flex flex-wrap gap-2">
        {allStepTypes.map((stepType) => {
          const stepsForType = groupedSteps[stepType] || [];
          const hasMultipleVersions = stepsForType.length > 1;
          const isDisabled = stepsForType.length === 0;

          return (
            <div key={stepType} className="relative">
              <Badge
                variant={getStepVariant(stepType)}
                className={`cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isDisabled && stepsForType.length > 0) {
                    onSelectStep(stepType, stepsForType[0].id);
                  }
                }}
              >
                {stepType}
                {hasMultipleVersions && (
                  <span className="ml-1 text-xs bg-gray-200 rounded-full px-1">
                    {stepsForType.length}
                  </span>
                )}
              </Badge>

              {hasMultipleVersions && (
                <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md z-10 hidden group-hover:block">
                  <div className="p-2">
                    {stepsForType.map((step) => (
                      <div
                        key={step.id}
                        className="cursor-pointer hover:bg-gray-100 p-1 text-sm"
                        onClick={() => onSelectStep(stepType, step.id)}
                      >
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
