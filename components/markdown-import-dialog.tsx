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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Import Markdown Notes
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                Upload a markdown file or paste content. Notes are automatically
                split by H1 headings (#).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-[1.2fr_1fr] gap-6 p-6 min-h-0 overflow-hidden">
          <div className="space-y-4 flex flex-col min-h-0">
            <div
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <FileText
                    className={`h-8 w-8 transition-colors ${
                      isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <p className="text-sm font-semibold mb-1.5">
                  Drop markdown file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports .md and .markdown files
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Or paste markdown content
                </label>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {markdown.length.toLocaleString()} / 100,000 characters
                  </span>
                  {markdown.trim() && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {previewNotes.length} note
                      {previewNotes.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder={`# Meeting Notes\n\nThis is a note about the meeting. #work #meeting\n\n# Ideas\n\nBrainstorming ideas here. #ideas`}
                className="flex-1 font-mono text-sm resize-none min-h-[200px]"
              />
            </div>
          </div>

          <div className="flex flex-col min-h-0 border-l pl-6">
            <div className="flex items-start gap-3 mb-4 shrink-0 pb-4 border-b">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1">Preview</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use H1 headings (
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    #
                  </code>
                  ) to separate notes. Add tags with{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    #tag
                  </code>{" "}
                  syntax.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
              {previewNotes.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 mb-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground">
                      {previewNotes.length} note
                      {previewNotes.length !== 1 ? "s" : ""} ready to import
                    </p>
                  </div>
                  {previewNotes.map((note, index) => (
                    <div
                      key={index}
                      className="group rounded-lg border bg-card p-4 space-y-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold line-clamp-1 mb-1">
                            {note.title || `Note ${index + 1}`}
                          </h5>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 font-mono"
                        >
                          {note.content.length}
                        </Badge>
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap pt-1">
                          {note.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No preview available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add markdown content to see a preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <div className="text-xs text-muted-foreground">
            {markdown.trim() && previewNotes.length > 0 && (
              <span>
                Ready to import{" "}
                <span className="font-medium text-foreground">
                  {previewNotes.length}
                </span>{" "}
                note{previewNotes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              className="min-w-[120px]"
            >
              {importMarkdown.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  Import {previewNotes.length} Note
                  {previewNotes.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
