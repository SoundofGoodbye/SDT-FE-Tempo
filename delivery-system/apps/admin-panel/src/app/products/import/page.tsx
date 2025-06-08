"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import ImportStepHeader from "@/components/products/ImportStepHeader";
import CompanySelector from "@/components/products/CompanySelector";
import ShopSelector from "@/components/products/ShopSelector";
import ImportOptionsPanel from "@/components/products/ImportOptionsPanel";
import {
  ImportWizardProvider,
  useImportWizard,
} from "@/components/products/ImportWizardContext";

function ImportPageContent() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [assignedCompanyId, setAssignedCompanyId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { state, nextStep, prevStep } = useImportWizard();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const companyId = localStorage.getItem("assignedCompanyId");
    setUserRole(role);
    setAssignedCompanyId(companyId);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authorization
  if (!userRole || (userRole !== "admin" && userRole !== "manager")) {
    return (
      <ForbiddenPage
        title="Import Access Denied"
        description="You don't have permission to import products. Only Admins and Managers can access this feature."
      />
    );
  }

  const isAdmin = userRole === "admin";
  const totalSteps = isAdmin ? 3 : 3;
  const companyName = "Acme Logistics"; // This would come from company data

  const getStepTitle = () => {
    if (isAdmin) {
      switch (state.step) {
        case 1:
          return "Select Target Company";
        case 2:
          return "Configure Advanced Options";
        case 3:
          return "Upload & Review";
        default:
          return "Import Products";
      }
    } else {
      switch (state.step) {
        case 1:
          return "Company Information";
        case 2:
          return "Select Target Shops";
        case 3:
          return "Template Selection";
        default:
          return "Import Products";
      }
    }
  };

  const getStepDescription = () => {
    if (isAdmin) {
      switch (state.step) {
        case 1:
          return "Choose which company to import products for";
        case 2:
          return "Configure validation and pricing options";
        case 3:
          return "Upload your product file and review before importing";
        default:
          return "Import products to your system";
      }
    } else {
      switch (state.step) {
        case 1:
          return "Review your current catalog status";
        case 2:
          return "Choose which shops will receive the imported products";
        case 3:
          return "Select an import template or upload custom file";
        default:
          return "Import products to your company";
      }
    }
  };

  const canProceed = () => {
    if (isAdmin) {
      switch (state.step) {
        case 1:
          return !!state.selectedCompanyId;
        case 2:
          return true; // Options are optional
        case 3:
          return true; // Will be validated when file is uploaded
        default:
          return false;
      }
    } else {
      switch (state.step) {
        case 1:
          return true; // Info step, always can proceed
        case 2:
          return (
            state.shopSelectionMode === "all" || state.selectedShops.length > 0
          );
        case 3:
          return true; // Will be validated when template is selected
        default:
          return false;
      }
    }
  };

  const renderStepContent = () => {
    if (isAdmin) {
      switch (state.step) {
        case 1:
          return <CompanySelector />;
        case 2:
          return <ImportOptionsPanel />;
        case 3:
          return (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload & Review (Coming Soon)
                  </h3>
                  <p className="text-muted-foreground">
                    File upload and review functionality will be implemented in
                    the next phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    } else {
      switch (state.step) {
        case 1:
          return (
            <ShopSelector
              companyId={assignedCompanyId || "1"}
              companyName={companyName}
            />
          );
        case 2:
          return (
            <ShopSelector
              companyId={assignedCompanyId || "1"}
              companyName={companyName}
            />
          );
        case 3:
          return (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Template Selection (Coming Soon)
                  </h3>
                  <p className="text-muted-foreground">
                    Template selection and file upload functionality will be
                    implemented in the next phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <h1 className="text-3xl font-bold">
          {isAdmin
            ? "Import Products (Admin)"
            : `Import Products - ${companyName}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "Import products for any company in the system"
            : "Import products to your company catalog"}
        </p>
      </div>

      {/* Step Header */}
      <ImportStepHeader
        currentStep={state.step}
        totalSteps={totalSteps}
        title={getStepTitle()}
        description={getStepDescription()}
        isAdmin={isAdmin}
      />

      {/* Step Content */}
      <div className="mb-8">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.step === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {state.step} of {totalSteps}
        </div>

        <Button
          onClick={nextStep}
          disabled={!canProceed() || state.step === totalSteps}
          className="flex items-center gap-2"
        >
          {state.step === totalSteps ? "Start Import" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ImportPage() {
  return (
    <ImportWizardProvider>
      <ImportPageContent />
    </ImportWizardProvider>
  );
}
