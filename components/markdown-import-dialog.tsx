"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useImportMarkdown } from "@/lib/api/hooks/use-notes";
import { toast } from "sonner";
import { FileText, Upload, Loader2, Info, FileUp } from "lucide-react";
import {
  validateMarkdownSize,
  parseMarkdownToNotes,
} from "@/lib/markdown-parser";

interface MarkdownImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkdownImportDialog({
  open,
  onOpenChange,
}: MarkdownImportDialogProps) {
  const [markdown, setMarkdown] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMarkdown = useImportMarkdown();

  const previewNotes = markdown.trim() ? parseMarkdownToNotes(markdown) : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      toast.error("Please upload a Markdown file (.md or .markdown)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMarkdown(content);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!markdown.trim()) {
      toast.error("Please enter or upload markdown content");
      return;
    }

    const validation = validateMarkdownSize(markdown);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const result = await importMarkdown.mutateAsync(markdown);

      toast.success(
        `Successfully imported ${result.notes.length} note${
          result.notes.length !== 1 ? "s" : ""
        }`
      );

      setMarkdown("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import markdown"
      );
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setMarkdown("");
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      toast.error("Please upload a Markdown file (.md or .markdown)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMarkdown(content);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Import Markdown Notes</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm">
            Upload a markdown file or paste content. Notes are automatically split by H1 headings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6 pb-6 min-h-0 overflow-hidden space-y-5">
          <div
            className={`rounded-md border-2 border-dashed transition-all cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Drop markdown file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports .md and .markdown files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Or paste markdown content
              </label>
              {markdown.trim() && (
                <span className="text-xs text-muted-foreground font-medium">
                  {previewNotes.length} note{previewNotes.length !== 1 ? "s" : ""} found
                </span>
              )}
            </div>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={`# Meeting Notes\n\nThis is a note about the meeting. #work #meeting\n\n# Ideas\n\nBrainstorming ideas here. #ideas`}
              className="flex-1 font-mono text-sm resize-none min-h-[200px]"
            />
          </div>

          {previewNotes.length > 0 && (
            <div className="rounded-md border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Preview
                </p>
                <span className="text-xs text-muted-foreground">
                  {previewNotes.length} note{previewNotes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2.5 max-h-40 overflow-y-auto">
                {previewNotes.slice(0, 4).map((note, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground font-mono shrink-0 mt-0.5">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">
                        {note.title || `Note ${index + 1}`}
                      </span>
                      {note.content && (
                        <span className="text-muted-foreground ml-2">
                          {note.content.substring(0, 60)}
                          {note.content.length > 60 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {previewNotes.length > 4 && (
                  <p className="text-xs text-muted-foreground pl-5">
                    +{previewNotes.length - 4} more note{previewNotes.length - 4 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => handleDialogClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              !markdown.trim() ||
              importMarkdown.isPending ||
              previewNotes.length === 0
            }
          >
            {importMarkdown.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${previewNotes.length} Note${
                previewNotes.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
