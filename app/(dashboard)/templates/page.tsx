"use client";

import { useState } from "react";
import { FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useTemplatesInfinite,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/lib/api/hooks";
import { isProPlan } from "@/lib/api/utils";
import { useDashboard } from "@/lib/contexts/dashboard-context";
import { toast } from "sonner";
import { TemplateDialog } from "./template-dialog";
import { TemplateCard } from "@/components/template-card";

export default function TemplatesPage() {
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTemplatesInfinite();

  const templates = infiniteData?.templates || [];
  const { usage } = useDashboard();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();

  const isPro = isProPlan(usage?.plan);
  const canCreateMore = isPro || templates.length < 1;

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      toast.success("Template deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete template"
      );
    }
  };

  const handleCreate = async (data: {
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
  }) => {
    try {
      await createTemplateMutation.mutateAsync(data);
      toast.success("Template created successfully");
      setShowCreateDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create template"
      );
    }
  };

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
  }) => {
    if (!editingTemplate) return;

    try {
      await updateTemplateMutation.mutateAsync({
        templateId: editingTemplate,
        ...data,
      });
      toast.success("Template updated successfully");
      setEditingTemplate(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update template"
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
            Templates
          </h1>
          <p className="text-muted-foreground tracking-wide font-lora text-sm">
            {isPro
              ? `Manage your ${templates.length} custom template${
                  templates.length === 1 ? "" : "s"
                }`
              : `Free plan: ${templates.length}/1 template${
                  templates.length === 1 ? " (limit reached)" : ""
                }`}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!canCreateMore}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first template to get started with structured notes
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!canCreateMore}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={setEditingTemplate}
                onDelete={handleDelete}
                isDeleting={deleteTemplateMutation.isPending}
                index={index}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                size="lg"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <TemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreate}
        isPending={createTemplateMutation.isPending}
      />

      {editingTemplate && (
        <TemplateDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          template={templates.find((t) => t.id === editingTemplate)}
          onSave={handleUpdate}
          isPending={updateTemplateMutation.isPending}
        />
      )}
    </div>
  );
}
