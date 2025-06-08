"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ImportWizardState {
  step: number;
  selectedCompanyId?: string;
  selectedShops: string[];
  shopSelectionMode: "all" | "select";
  createBackup: boolean;
  validateAgainstMaster: boolean;
  applyGlobalPricing: boolean;
  copyToMultipleCompanies: boolean;
  overrideCompanySettings: boolean;
}

interface ImportWizardContextType {
  state: ImportWizardState;
  updateState: (updates: Partial<ImportWizardState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
}

const ImportWizardContext = createContext<ImportWizardContextType | undefined>(
  undefined,
);

const initialState: ImportWizardState = {
  step: 1,
  selectedCompanyId: undefined,
  selectedShops: [],
  shopSelectionMode: "all",
  createBackup: false,
  validateAgainstMaster: true,
  applyGlobalPricing: true,
  copyToMultipleCompanies: false,
  overrideCompanySettings: false,
};

export function ImportWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ImportWizardState>(initialState);

  const updateState = (updates: Partial<ImportWizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const resetWizard = () => {
    setState(initialState);
  };

  return (
    <ImportWizardContext.Provider
      value={{ state, updateState, nextStep, prevStep, resetWizard }}
    >
      {children}
    </ImportWizardContext.Provider>
  );
}

export function useImportWizard() {
  const context = useContext(ImportWizardContext);
  if (context === undefined) {
    throw new Error(
      "useImportWizard must be used within an ImportWizardProvider",
    );
  }
  return context;
}
