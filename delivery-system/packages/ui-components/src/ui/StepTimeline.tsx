import React from "react";
import { Badge } from "./badge";

// Generic step type that can work with any data structure
export type TimelineStep = {
  id: string;
  label: string;
  isSelected?: boolean;
  metadata?: any; // Additional data that might be needed
};

type StepTimelineProps = {
  steps: TimelineStep[];
  onSelectStep: (stepId: string) => void;
  groupedSteps?: Record<string, TimelineStep[]>;
  className?: string;
};

export const StepTimeline: React.FC<StepTimelineProps> = ({
                                                            steps = [],
                                                            onSelectStep,
                                                            groupedSteps = {},
                                                            className = "",
                                                          }) => {
  const getStepVariant = (step: TimelineStep) => {
    return step.isSelected ? "default" : "outline";
  };

  // If we have grouped steps, render them by group
  if (Object.keys(groupedSteps).length > 0) {
    return (
        <div className={`w-full overflow-x-auto ${className}`}>
          <div className="flex gap-2 mb-2">
            {Object.entries(groupedSteps).map(([groupLabel, groupSteps]) => (
                <div key={groupLabel} className="relative">
                  {groupSteps.map((step) => (
                      <Badge
                          key={step.id}
                          variant={step.isSelected ? "default" : "outline"}
                          className={`${step.isSelected ? 'border-2 border-primary' : ''} whitespace-nowrap mb-1 cursor-pointer`}
                          onClick={() => onSelectStep(step.id)}
                      >
                        {step.label}
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
                    className={`${step.isSelected ? 'border-2 border-primary' : ''} whitespace-nowrap cursor-pointer`}
                    onClick={() => onSelectStep(step.id)}
                >
                  {step.label}
                </Badge>
              </div>
          ))}
        </div>
      </div>
  );
};