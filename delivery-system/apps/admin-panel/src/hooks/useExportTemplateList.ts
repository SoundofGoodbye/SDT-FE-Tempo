import { useState, useEffect, useMemo } from "react";
import { ExportTemplate } from "@/types/template";

// Mock export template data
const mockExportTemplates: ExportTemplate[] = [
  {
    id: "export-1",
    name: "Daily Product Report",
    format: "Excel",
    fields: ["name", "sku", "price", "stock", "category"],
    schedule: "Daily 6:00 PM",
    companyId: "company-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "export-2",
    name: "Weekly Sales Summary",
    format: "PDF",
    fields: ["product", "sales", "revenue", "profit"],
    schedule: "Weekly Monday",
    companyId: "company-1",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-10",
  },
  {
    id: "export-3",
    name: "Monthly Inventory CSV",
    format: "CSV",
    fields: ["sku", "name", "stock", "location", "value"],
    schedule: "Monthly 1st",
    companyId: "company-2",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
];

export function useExportTemplateList(companyId?: string) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!companyId) return [];
    return mockExportTemplates.filter(
      (template) => template.companyId === companyId,
    );
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTemplates(filteredTemplates);
      setLoading(false);
    }, 500);
  }, [filteredTemplates]);

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId),
    );
  };

  const addTemplate = (templateData: Partial<ExportTemplate>) => {
    const newTemplate: ExportTemplate = {
      id: `export-temp-${Date.now()}`,
      name: templateData.name || "New Export Template",
      format: templateData.format || "Excel",
      fields: templateData.fields || [],
      schedule: templateData.schedule || "Daily 6:00 PM",
      companyId: templateData.companyId || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const updateTemplate = (templateData: Partial<ExportTemplate>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateData.id
          ? {
              ...template,
              ...templateData,
              updatedAt: new Date().toISOString(),
            }
          : template,
      ),
    );
  };

  return {
    templates,
    loading,
    error,
    deleteTemplate,
    addTemplate,
    updateTemplate,
  };
}
