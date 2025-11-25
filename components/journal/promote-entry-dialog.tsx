"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TiptapEditor } from "@/components/tiptap-editor";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { usePromoteJournalEntry } from "@/lib/api/hooks";
import { Loader2, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";
import type { JournalEntry } from "@/lib/api/types";

interface PromoteEntryDialogProps {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PromoteEntryDialog({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: PromoteEntryDialogProps) {
  const [content, setContent] = useState(entry.content);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const promoteMutation = usePromoteJournalEntry();

  useEffect(() => {
    if (open) {
      setContent(entry.content);
      setTitle("");
      setTags([]);
      setIsPreview(false);
    }
  }, [open, entry]);

  const handlePromote = async () => {
    if (!content.trim()) {
      toast.error("Cannot be empty");
      return;
    }

    try {
      await promoteMutation.mutateAsync({
        id: entry.id,
        content: content.trim(),
        title: title.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success("Converted");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      if (err.status === 402) {
        toast.error(err.message || "Insufficient credits");
      } else {
        toast.error("Conversion failed");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] border border-border/60 bg-background ring-1 ring-border/50 ring-offset-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:ring-border/60 dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)] p-0 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-border/30">
          <DialogHeader>
            <DialogTitle>Make it searchable</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/70 font-lora mt-2 leading-relaxed tracking-wide">
              Transform this entry into a searchable note. Edit, add a title,
              and tags. 2 credits.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-normal text-foreground/80"
              >
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title..."
                className="border border-border/60 bg-background focus:border-border/70 focus:shadow-[0_2px_8px_rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)] dark:focus:shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal text-foreground/80">
                  Content
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={isPreview ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => setIsPreview(false)}
                    className="h-8 text-[13px] font-normal"
                  >
                    <Edit3 className="h-3 w-3 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={isPreview ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setIsPreview(true)}
                    disabled={!content.trim()}
                    className="h-8 text-[13px] font-normal"
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    Preview
                  </Button>
                </div>
              </div>

              {isPreview ? (
                <div className="min-h-[200px] rounded-lg border border-border/60 bg-muted/30 p-4 ring-1 ring-border/50 ring-offset-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                  {content.trim() ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={content} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground/70 italic">
                      Nothing to preview yet. Write some content first.
                    </p>
                  )}
                </div>
              ) : (
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Edit your entry..."
                />
              )}
            </div>

            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tags..."
            />

            <div className="rounded-lg border border-border/40 bg-muted/40 p-3 text-sm text-muted-foreground/80 ring-1 ring-border/30 ring-offset-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              <p>
                This will cost{" "}
                <strong className="text-foreground/90">2 credits</strong> to
                create a searchable note with AI categorization.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border/30 gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={promoteMutation.isPending}
            className="text-[13px] font-normal text-muted-foreground/70 hover:text-foreground/80 hover:bg-transparent transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={promoteMutation.isPending || !content.trim()}
            className="text-[13px] font-normal text-foreground/80 border border-border/50 bg-background/90 hover:border-border/60 hover:bg-background hover:text-foreground shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition-all duration-200 dark:border-border/60 dark:bg-background/70 dark:hover:border-border/70 dark:hover:bg-background/80 dark:shadow-[0_1px_1px_rgba(0,0,0,0.08)] disabled:opacity-40"
          >
            {promoteMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Converting
              </>
            ) : (
              "Convert to Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
