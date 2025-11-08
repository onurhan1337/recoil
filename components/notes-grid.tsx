"use client";

import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteDetailsDialog } from "@/components/note-details-dialog";
import { formatShortDate } from "@/lib/utils";
import type { Note } from "@/lib/api/types";

interface NotesGridProps {
  notes: Note[];
}

export function NotesGrid({ notes }: NotesGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteDetailsDialog
          key={note.id}
          note={note}
          trigger={
            <button
              data-note-id={note.id}
              className="group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 text-left w-full"
            >
              <div className="flex-1 flex flex-col gap-3">
                {note.label && (
                  <h3 className="text-sm font-medium line-clamp-1">{note.label}</h3>
                )}
                <div className="text-sm line-clamp-6 leading-relaxed font-lora">
                  <MarkdownRenderer content={note.content} />
                </div>
                <div className="mt-auto pt-2 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {note.category && (
                      <Badge variant="secondary" className="text-xs">
                        {note.category}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(note.created_at)}
                  </span>
                </div>
              </div>
            </button>
          }
        />
      ))}
    </div>
  );
}
