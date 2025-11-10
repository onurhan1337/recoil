"use client";

import { useState } from "react";
import { Trash2, Edit2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/lib/api/hooks";
import { useUsage } from "@/lib/api/hooks";
import { isProPlan } from "@/lib/api/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TemplatesSection() {
  const { data: templates = [], isLoading } = useTemplates();
  const { data: usage } = useUsage();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Templates</h3>
          <p className="text-sm text-muted-foreground">
            {isPro
              ? "Manage your custom note templates"
              : `Free plan: ${templates.length}/1 template${templates.length === 1 ? " (limit reached)" : ""}`}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} disabled={!canCreateMore}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
          No custom templates yet. Create your first template to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {template.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(template.id)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteTemplateMutation.isPending}
                >
                  {deleteTemplateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={async (data) => {
          try {
            await createTemplateMutation.mutateAsync(data);
            toast.success("Template created successfully");
            setShowCreateDialog(false);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Failed to create template"
            );
          }
        }}
        isPending={createTemplateMutation.isPending}
      />

      {editingTemplate && (
        <TemplateDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          template={templates.find((t) => t.id === editingTemplate)}
          onSave={async (data) => {
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
          }}
          isPending={updateTemplateMutation.isPending}
        />
      )}
    </div>
  );
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    name: string;
    description?: string | null;
    content: string;
    category?: string | null;
    tags?: string[] | null;
  };
  onSave: (data: {
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
  }) => Promise<void>;
  isPending: boolean;
}

function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
  isPending,
}: TemplateDialogProps) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [content, setContent] = useState(template?.content || "");
  const [category, setCategory] = useState(template?.category || "");
  const [tags, setTags] = useState<string[]>(template?.tags || []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Template content is required");
      return;
    }

    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      content: content.trim(),
      category: category.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "New Template"}</DialogTitle>
          <DialogDescription>
            {template
              ? "Update your template details"
              : "Create a new reusable template"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category (Optional)</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Meeting, Research..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter template content..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || !name.trim() || !content.trim()}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

