"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  isAdmin: boolean;
}

export default function ImportStepHeader({
  currentStep,
  totalSteps,
  title,
  description,
  isAdmin,
}: ImportStepHeaderProps) {
  const steps = isAdmin
    ? [
        {
          number: 1,
          title: "Select Company",
          description: "Choose target company",
        },
        {
          number: 2,
          title: "Advanced Options",
          description: "Configure import settings",
        },
        {
          number: 3,
          title: "Upload & Review",
          description: "Upload file and review",
        },
      ]
    : [
        {
          number: 1,
          title: "Company Info",
          description: "Review catalog status",
        },
        {
          number: 2,
          title: "Select Shops",
          description: "Choose target shops",
        },
        {
          number: 3,
          title: "Template Selection",
          description: "Choose import template",
        },
      ];

  return (
    <div className="bg-background">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    step.number < currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : step.number === currentStep
                        ? "border-primary text-primary bg-background"
                        : "border-muted-foreground text-muted-foreground bg-background",
                  )}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      step.number <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 transition-colors",
                    step.number < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                <Badge variant="outline">
                  Step {currentStep} of {totalSteps}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
