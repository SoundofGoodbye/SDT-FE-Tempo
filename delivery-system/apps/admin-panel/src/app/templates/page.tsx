"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useTemplateList } from "@/hooks/useTemplateList";
import { useExportTemplateList } from "@/hooks/useExportTemplateList";
import { Template, ExportTemplate } from "@/types/template";
import CompanySelector from "@/components/templates/CompanySelector";
import TemplateTable from "@/components/templates/TemplateTable";
import ExportTemplateTable from "@/components/templates/ExportTemplateTable";
import TemplateEditorModal from "@/components/templates/TemplateEditorModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TemplatesPage() {
  const { user, loading: userLoading } = useUser();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<
    Template | ExportTemplate | null
  >(null);

  // For managers, use their companyId; for admins, use selected company
  const effectiveCompanyId =
    user?.role === "Manager" ? user.companyId : selectedCompanyId;

  const {
    templates,
    loading: templatesLoading,
    deleteTemplate,
    addTemplate,
    updateTemplate,
  } = useTemplateList(effectiveCompanyId);

  const {
    templates: exportTemplates,
    loading: exportTemplatesLoading,
    deleteTemplate: deleteExportTemplate,
    addTemplate: addExportTemplate,
    updateTemplate: updateExportTemplate,
  } = useExportTemplateList(effectiveCompanyId);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplate(templateId);
  };

  const handleNewExportTemplate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleEditExportTemplate = (template: ExportTemplate) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const handleDeleteExportTemplate = (templateId: string) => {
    deleteExportTemplate(templateId);
  };

  const handleSaveTemplate = (
    templateData: Partial<Template | ExportTemplate>,
  ) => {
    const isExportTemplate = "schedule" in templateData;

    if (editingTemplate) {
      // Update existing template
      if (isExportTemplate) {
        updateExportTemplate(templateData as Partial<ExportTemplate>);
      } else {
        updateTemplate(templateData as Partial<Template>);
      }
    } else {
      // Create new template
      if (isExportTemplate) {
        addExportTemplate(templateData as Partial<ExportTemplate>);
      } else {
        addTemplate(templateData as Partial<Template>);
      }
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="mt-2 text-gray-600">
            Manage your import and export templates for efficient data
            processing.
          </p>
        </div>

        {/* Company Selector for Admins */}
        {user?.role === "Admin" && (
          <div className="mb-6">
            <CompanySelector
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
          </div>
        )}

        {/* Import Templates Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Import Templates
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Templates for importing data into the system
              </p>
            </div>
            <Button
              onClick={handleNewTemplate}
              disabled={!effectiveCompanyId}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>

          {/* Show message if no company selected (for admins) */}
          {user?.role === "Admin" && !selectedCompanyId ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-500">
                Please select a company to view templates.
              </p>
            </div>
          ) : (
            <TemplateTable
              templates={templates}
              loading={templatesLoading}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          )}
        </div>

        {/* Export Templates Section */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Export Templates
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Templates for exporting data from the system
              </p>
            </div>
            <Button
              onClick={handleNewExportTemplate}
              disabled={!effectiveCompanyId}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>

          {/* Show message if no company selected (for admins) */}
          {user?.role === "Admin" && !selectedCompanyId ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-500">
                Please select a company to view export templates.
              </p>
            </div>
          ) : (
            <ExportTemplateTable
              templates={exportTemplates}
              loading={exportTemplatesLoading}
              onEdit={handleEditExportTemplate}
              onDelete={handleDeleteExportTemplate}
            />
          )}
        </div>

        {/* Template Editor Modal */}
        <TemplateEditorModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          companyId={effectiveCompanyId}
        />
      </div>
    </div>
  );
}
