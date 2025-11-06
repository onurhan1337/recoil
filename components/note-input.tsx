"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap-editor";
import { toast } from "sonner";

interface NoteInputProps {
  onNoteCreated?: () => void;
}

export function NoteInput({ onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create note");
      }

      toast.success("Note saved successfully");
      setContent("");
      onNoteCreated?.();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
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
          disabled={isLoading || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 h-9 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
