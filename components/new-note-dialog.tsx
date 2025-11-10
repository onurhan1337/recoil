"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NoteInput } from "@/components/note-input";
import { TemplateSelector } from "@/components/template-selector";
import { FileText } from "lucide-react";
import type { NoteTemplate } from "@/lib/note-templates";

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewNoteDialog({ open, onOpenChange }: NewNoteDialogProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    NoteTemplate | undefined
  >();
  const [key, setKey] = useState(0);

  const resetState = () => {
    setSelectedTemplate(undefined);
    setKey((prev) => prev + 1);
  };

  const handleNoteCreated = () => {
    onOpenChange(false);
    resetState();
  };

  const handleSelectTemplate = (template: NoteTemplate) => {
    setSelectedTemplate(template);
    setKey((prev) => prev + 1);
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  New Note
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Capture your thoughts and ideas
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </DialogHeader>
          <div className="mb-6">
            <NoteInput
              key={key}
              onNoteCreated={handleNoteCreated}
              initialTemplate={selectedTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}
