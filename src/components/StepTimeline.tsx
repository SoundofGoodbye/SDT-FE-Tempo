import React from "react";
import { Badge } from "./ui/badge";

export type DeliveryStep = {
  id: string;
  stepType: string;
  isCheckpoint?: boolean;
  timestamp?: string;
  productListDetailsId?: number;
};

type StepTimelineProps = {
  steps: DeliveryStep[];
  selectedStepType: string | null;
  onSelectStep: (stepType: string, versionId: string) => void;
  groupedSteps?: Record<string, DeliveryStep[]>;
  className?: string;
};

export const StepTimeline: React.FC<StepTimelineProps> = ({
  steps = [],
  selectedStepType,
  onSelectStep,
  groupedSteps = {},
  className = "",
}) => {
  const getStepVariant = (step: DeliveryStep) => {
    // Highlight current step
    if (step.stepType === selectedStepType) {
      return step.isCheckpoint ? "default" : "secondary";
    }

    // Style based on checkpoint status
    return step.isCheckpoint ? "outline" : "secondary";
  };

  // If we have grouped steps, render them by group
  if (Object.keys(groupedSteps).length > 0) {
    return (
      <div className={`w-full overflow-x-auto ${className}`}>
        <div className="flex gap-2 mb-2">
          {Object.entries(groupedSteps).map(([stepType, versions]) => (
            <div key={stepType} className="relative">
              {versions.map((version) => (
                <Badge
                  key={version.id}
                  variant={version.stepType === selectedStepType ? "default" : "outline"}
                  className={`${version.stepType === selectedStepType ? 'border-2 border-primary' : ''} whitespace-nowrap mb-1 cursor-pointer`}
                  onClick={() => onSelectStep(version.stepType, version.id)}
                >
                  {version.stepType}
                </Badge>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render the flat list of steps
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="flex gap-2 mb-2">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <Badge
              variant={getStepVariant(step)}
              className={`${step.stepType === selectedStepType ? 'border-2 border-primary' : ''} whitespace-nowrap cursor-pointer`}
              onClick={() => onSelectStep(step.stepType, step.id)}
            >
              {step.stepType}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
