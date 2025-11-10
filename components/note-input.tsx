"use client";

import { useState, useEffect } from "react";
import { Loader2, Send, Info, Eye, Edit3 } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateNote, useEstimateNoteCost } from "@/lib/api/hooks";
import type { NoteTemplate } from "@/lib/note-templates";

interface NoteInputProps {
  onNoteCreated?: () => void;
  initialTemplate?: NoteTemplate;
}

export function NoteInput({ onNoteCreated, initialTemplate }: NoteInputProps) {
  const [content, setContent] = useState(initialTemplate?.content || "");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const createNoteMutation = useCreateNote();

  useEffect(() => {
    if (initialTemplate) {
      setContent(initialTemplate.content || "");
      setTags(initialTemplate.tags || []);
    }
  }, [initialTemplate]);

  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedContent(content);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content]);

  const { data: costEstimate } = useEstimateNoteCost(debouncedContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        content,
        title: title.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      toast.success("Note saved successfully");
      setContent("");
      setTitle("");
      setTags([]);
      onNoteCreated?.();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="font-medium shadow-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isPreview ? "ghost" : "secondary"}
              size="sm"
              onClick={() => setIsPreview(false)}
              className="h-8"
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
              className="h-8"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              Preview
            </Button>
          </div>
        </div>

        {isPreview ? (
          <div className="min-h-[200px] rounded-lg border bg-muted/30 p-4">
            {content.trim() ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nothing to preview yet. Write some content first.
              </p>
            )}
          </div>
        ) : (
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Write your note..."
          />
        )}
      </div>

      <TagInput value={tags} onChange={setTags} />

      <div className="flex items-center justify-between">
        {costEstimate && content.trim() && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>
              Cost:{" "}
              <strong className="text-foreground">
                {costEstimate.estimated_cost}
              </strong>{" "}
              credits
              {costEstimate.estimated_chunks > 1 && (
                <span className="ml-1 text-[10px]">
                  ({costEstimate.base_cost} base
                  {costEstimate.embedding_cost > 0 && (
                    <> + {costEstimate.embedding_cost} embedding</>
                  )}
                  {costEstimate.embedding_cost === 0 && (
                    <> • {costEstimate.estimated_chunks} chunks (free)</>
                  )}
                  )
                </span>
              )}
            </span>
          </div>
        )}
        <button
          type="submit"
          disabled={createNoteMutation.isPending || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 h-9 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {createNoteMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Save Note
            </>
          )}
        </button>
      </div>
    </form>
  );
}
