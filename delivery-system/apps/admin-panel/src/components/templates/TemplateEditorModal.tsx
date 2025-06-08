"use client";

import { useState, useEffect } from "react";
import { Template, ExportTemplate } from "@/types/template";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | ExportTemplate | null;
  onSave: (template: Partial<Template | ExportTemplate>) => void;
  companyId: string;
}

type TemplateType = "Import" | "Export";
type TemplateFormat = "Excel" | "CSV" | "PDF";
type ScheduleOption = "Daily" | "Weekly" | "Monthly";

const AVAILABLE_FIELDS = [
  "name",
  "sku",
  "price",
  "category",
  "description",
  "stock",
  "specifications",
  "images",
  "location",
  "value",
  "sales",
  "revenue",
  "profit",
];

export default function TemplateEditorModal({
  open,
  onOpenChange,
  template,
  onSave,
  companyId,
}: TemplateEditorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Import" as TemplateType,
    format: "Excel" as TemplateFormat,
    fields: [] as string[],
    schedule: "Daily" as ScheduleOption,
    validationOptions: {
      skipDuplicates: false,
      requireMandatory: false,
      autoDetectTypes: false,
    },
  });
  const [newField, setNewField] = useState("");

  // Determine if this is an export template
  const isExportTemplate = (
    tmpl: Template | ExportTemplate,
  ): tmpl is ExportTemplate => {
    return "schedule" in tmpl;
  };

  useEffect(() => {
    if (template) {
      const isExport = isExportTemplate(template);
      setFormData({
        name: template.name,
        type: isExport ? "Export" : "Import",
        format: template.format as TemplateFormat,
        fields: [...template.fields],
        schedule: isExport
          ? (template.schedule.split(" ")[0] as ScheduleOption)
          : "Daily",
        validationOptions: {
          skipDuplicates: false,
          requireMandatory: false,
          autoDetectTypes: false,
        },
      });
    } else {
      // Reset form for new template
      setFormData({
        name: "",
        type: "Import",
        format: "Excel",
        fields: [],
        schedule: "Daily",
        validationOptions: {
          skipDuplicates: false,
          requireMandatory: false,
          autoDetectTypes: false,
        },
      });
    }
  }, [template, open]);

  const handleSave = () => {
    const baseTemplate = {
      id: template?.id || `temp-${Date.now()}`,
      name: formData.name,
      format: formData.format,
      fields: formData.fields,
      companyId,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (formData.type === "Export") {
      const exportTemplate: Partial<ExportTemplate> = {
        ...baseTemplate,
        schedule: `${formData.schedule} ${formData.schedule === "Daily" ? "6:00 PM" : formData.schedule === "Weekly" ? "Monday" : "1st"}`,
      };
      onSave(exportTemplate);
    } else {
      const importTemplate: Partial<Template> = {
        ...baseTemplate,
        type: "Products" as const,
        lastUsed: template && "lastUsed" in template ? template.lastUsed : null,
      };
      onSave(importTemplate);
    }

    onOpenChange(false);
  };

  const addField = (field: string) => {
    if (field && !formData.fields.includes(field)) {
      setFormData((prev) => ({
        ...prev,
        fields: [...prev.fields, field],
      }));
    }
  };

  const removeField = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f !== field),
    }));
  };

  const addCustomField = () => {
    if (newField.trim()) {
      addField(newField.trim());
      setNewField("");
    }
  };

  const isFormValid = formData.name.trim() && formData.fields.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter template name"
            />
          </div>

          {/* Template Type */}
          <div className="space-y-2">
            <Label>Template Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TemplateType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Import">Import</SelectItem>
                <SelectItem value="Export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value: TemplateFormat) =>
                setFormData((prev) => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                {formData.type === "Export" && (
                  <SelectItem value="PDF">PDF</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Fields Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                {formData.type === "Import"
                  ? "Column Mapping"
                  : "Export Fields"}
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                {formData.type === "Import"
                  ? "Select the columns to map from your import file"
                  : "Choose which fields to include in the export"}
              </p>
            </div>

            {/* Available Fields */}
            <div>
              <Label className="text-sm font-medium">Available Fields</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_FIELDS.map((field) => (
                  <Button
                    key={field}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(field)}
                    disabled={formData.fields.includes(field)}
                    className="h-8 text-xs"
                  >
                    {field}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Field Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom field"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomField()}
                className="flex-1"
              />
              <Button onClick={addCustomField} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Fields */}
            {formData.fields.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.fields.map((field) => (
                    <Badge
                      key={field}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {field}
                      <button
                        onClick={() => removeField(field)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Schedule */}
          {formData.type === "Export" && (
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={formData.schedule}
                onValueChange={(value: ScheduleOption) =>
                  setFormData((prev) => ({ ...prev, schedule: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Validation Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Validation Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={formData.validationOptions.skipDuplicates}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      validationOptions: {
                        ...prev.validationOptions,
                        skipDuplicates: checked as boolean,
                      },
                    }))
                  }
                />
                <Label htmlFor="skipDuplicates" className="text-sm">
                  Skip duplicate codes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireMandatory"
                  checked={formData.validationOptions.requireMandatory}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      validationOptions: {
                        ...prev.validationOptions,
                        requireMandatory: checked as boolean,
                      },
                    }))
                  }
                />
                <Label htmlFor="requireMandatory" className="text-sm">
                  Require mandatory fields
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoDetectTypes"
                  checked={formData.validationOptions.autoDetectTypes}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      validationOptions: {
                        ...prev.validationOptions,
                        autoDetectTypes: checked as boolean,
                      },
                    }))
                  }
                />
                <Label
                  htmlFor="autoDetectTypes"
                  className="text-sm text-gray-600"
                >
                  Auto-detect field types (optional)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            {template ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
