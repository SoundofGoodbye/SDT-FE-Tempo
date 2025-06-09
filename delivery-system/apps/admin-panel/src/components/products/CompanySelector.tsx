"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Building2, Package, Calendar } from "lucide-react";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useImportWizard } from "./ImportWizardContext";

export default function CompanySelector() {
  const { allCompanies } = useCompanyList();
  const { state, updateState } = useImportWizard();

  const selectedCompany = allCompanies.find(
    (c) => c.id === state.selectedCompanyId,
  );

  const handleCompanyChange = (companyId: string) => {
    updateState({ selectedCompanyId: companyId });
  };

  const handleBackupChange = (checked: boolean) => {
    updateState({ createBackup: checked });
  };

  return (
    <div className="space-y-6 bg-background">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Target Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-select" className="text-sm font-medium">
              Company
            </Label>
            <Select
              value={state.selectedCompanyId || ""}
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a company..." />
              </SelectTrigger>
              <SelectContent>
                {allCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{company.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {company.productsCount} products
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Info Card */}
          {selectedCompany && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedCompany.productsCount} Products
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current catalog size
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(
                          selectedCompany.updatedAt,
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last import
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedCompany.shopsCount} Shops
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active locations
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backup Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-backup"
              checked={state.createBackup}
              onCheckedChange={handleBackupChange}
            />
            <Label htmlFor="create-backup" className="text-sm">
              Create backup before import
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
