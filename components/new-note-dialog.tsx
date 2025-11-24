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
            <div>
              <DialogTitle className="text-lg font-medium font-lora">
                New Note
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <i className="font-lora bg-linear-to-r from-red-950 via-red-700 to-red-950 bg-clip-text pr-1 text-transparent">
                  Connecting the dots
                </i>{" "}
                between your thoughts and ideas...
              </p>
            </div>
          </DialogHeader>
          <div className="mb-6">
            <div className="flex items-center justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
                className="text-muted-foreground hover:text-foreground h-8 text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Use Template
              </Button>
            </div>
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
