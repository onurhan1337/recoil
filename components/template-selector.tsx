"use client";

import { noteTemplates, type NoteTemplate } from "@/lib/note-templates";
import { useTemplates } from "@/lib/api/hooks";
import {
  FileText,
  Users,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Heart,
  Code,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: NoteTemplate) => void;
}

const templateIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  blank: FileText,
  meeting: Users,
  idea: Lightbulb,
  task: CheckSquare,
  research: BookOpen,
  journal: Heart,
  "code-snippet": Code,
};

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const { data: customTemplates = [] } = useTemplates();

  const handleSelectTemplate = (template: NoteTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const builtInTemplates = noteTemplates;
  const allCustomTemplates = customTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description || "",
    content: t.content,
    category: t.category || undefined,
    tags: t.tags || undefined,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to get started quickly with structured notes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {allCustomTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Custom Templates</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {allCustomTemplates.map((template) => {
                  const Icon = template.category
                    ? templateIcons[template.category.toLowerCase()] || FileText
                    : FileText;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            {allCustomTemplates.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Built-in Templates</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {builtInTemplates.map((template) => {
                const Icon = templateIcons[template.id] || FileText;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
