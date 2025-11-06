"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
import { toast } from "sonner";
import { useCreateNote } from "@/lib/api/hooks";

interface NoteInputProps {
  onNoteCreated?: () => void;
}

export function NoteInput({ onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState("");
  const createNoteMutation = useCreateNote();

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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createNoteMutation.isPending || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 h-9 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
