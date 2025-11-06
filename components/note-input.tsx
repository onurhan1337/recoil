"use client";

import { useState, useMemo } from "react";
import { Loader2, Send, Info } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
import { toast } from "sonner";
import { useCreateNote, useEstimateNoteCost } from "@/lib/api/hooks";

interface NoteInputProps {
  onNoteCreated?: () => void;
}

export function NoteInput({ onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState("");
  const createNoteMutation = useCreateNote();

  const debouncedContent = useMemo(() => {
    const timeoutId = setTimeout(() => content, 500);
    return content;
  }, [content]);

  const { data: costEstimate } = useEstimateNoteCost(debouncedContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    try {
      await createNoteMutation.mutateAsync(content);
      toast.success("Note saved successfully");
      setContent("");
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
      <TiptapEditor
        content={content}
        onChange={setContent}
        placeholder="Write your note..."
      />

      <div className="flex items-center justify-between">
        {costEstimate && content.trim() && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>
              Cost: <strong className="text-foreground">{costEstimate.estimated_cost}</strong> credits
              {costEstimate.embedding_cost > 0 && (
                <span className="ml-1 text-[10px]">
                  ({costEstimate.base_cost} base + {costEstimate.embedding_cost} vectorizing)
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
