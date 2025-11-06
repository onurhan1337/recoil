"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useNotes } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";

export default function NotesPage() {
  const { data: notes = [], isLoading } = useNotes();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Notes</h1>
        <p className="text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"} in your
          collection
        </p>
      </div>

      {notes.length > 0 && (
        <div className="rounded-md border bg-muted/50 p-4 text-sm">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Looking for something specific? Use{" "}
              <Link
                href="/"
                className="font-medium text-foreground hover:underline underline-offset-4"
              >
                AI chat
              </Link>{" "}
              to search through your notes with natural language and get intelligent answers.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No notes yet. Click "New Note" to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group relative overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50"
            >
              <div className="space-y-3">
                <div className="text-sm line-clamp-6 leading-relaxed font-lora">
                  <MarkdownRenderer content={note.content} />
                </div>
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(note.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
