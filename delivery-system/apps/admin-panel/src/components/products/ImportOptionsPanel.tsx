"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, Database, DollarSign, Copy, Shield } from "lucide-react";
import { useImportWizard } from "./ImportWizardContext";

export default function ImportOptionsPanel() {
  const { state, updateState } = useImportWizard();

  const handleOptionChange = (option: keyof typeof state, checked: boolean) => {
    updateState({ [option]: checked });
  };

  const options = [
    {
      key: "validateAgainstMaster" as const,
      icon: <Database className="h-4 w-4" />,
      label: "Validate against master product DB",
      description: "Check for duplicates and conflicts with existing products",
      checked: state.validateAgainstMaster,
      recommended: true,
    },
    {
      key: "applyGlobalPricing" as const,
      icon: <DollarSign className="h-4 w-4" />,
      label: "Apply global pricing rules",
      description: "Automatically apply company-wide pricing policies",
      checked: state.applyGlobalPricing,
      recommended: true,
    },
    {
      key: "copyToMultipleCompanies" as const,
      icon: <Copy className="h-4 w-4" />,
      label: "Copy products to multiple companies",
      description: "Allow importing the same products to other companies",
      checked: state.copyToMultipleCompanies,
      recommended: false,
    },
    {
      key: "overrideCompanySettings" as const,
      icon: <Shield className="h-4 w-4" />,
      label: "Override company-specific settings",
      description: "Use global settings instead of company preferences",
      checked: state.overrideCompanySettings,
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Import Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option) => (
            <div
              key={option.key}
              className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1">
                <Checkbox
                  id={option.key}
                  checked={option.checked}
                  onCheckedChange={(checked) =>
                    handleOptionChange(option.key, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.key}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                    {option.recommended && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">
            Import Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Validation:</span>
              <span
                className={
                  state.validateAgainstMaster
                    ? "text-green-600"
                    : "text-muted-foreground"
                }
              >
                {state.validateAgainstMaster ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pricing Rules:</span>
              <span
                className={
                  state.applyGlobalPricing
                    ? "text-green-600"
                    : "text-muted-foreground"
                }
              >
                {state.applyGlobalPricing ? "Apply Global" : "Use Default"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Multi-Company:</span>
              <span
                className={
                  state.copyToMultipleCompanies
                    ? "text-blue-600"
                    : "text-muted-foreground"
                }
              >
                {state.copyToMultipleCompanies ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Override Settings:</span>
              <span
                className={
                  state.overrideCompanySettings
                    ? "text-orange-600"
                    : "text-muted-foreground"
                }
              >
                {state.overrideCompanySettings ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
