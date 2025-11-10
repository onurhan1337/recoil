"use client";

import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteDetailsDialog } from "@/components/note-details-dialog";
import { formatShortDate } from "@/lib/utils";
import { Pin } from "lucide-react";
import type { Note } from "@/lib/api/types";

interface NotesGridProps {
  notes: Note[];
}

export function NotesGrid({ notes }: NotesGridProps) {
  const isLabelRedundant = (
    label: string | null | undefined,
    content: string
  ): boolean => {
    if (!label) return true;

    const plainContent = content.replace(/^#+\s*/, "").trim();
    const contentStart = plainContent.slice(0, 60).trim();
    const labelTrimmed = label.replace(/\.\.\.$/, "").trim();

    return (
      contentStart.toLowerCase().startsWith(labelTrimmed.toLowerCase()) ||
      labelTrimmed.toLowerCase() ===
        contentStart.slice(0, labelTrimmed.length).toLowerCase()
    );
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sortedNotes.map((note) => {
        const showLabel =
          note.label && !isLabelRedundant(note.label, note.content);

        return (
          <NoteDetailsDialog
            key={note.id}
            note={note}
            trigger={
              <button
                data-note-id={note.id}
                className={`group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 text-left w-full h-[280px] ${
                  note.pinned
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                }`}
              >
                {note.pinned && (
                  <div className="absolute top-2 right-2">
                    <Pin className="h-4 w-4 text-primary fill-primary" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  {showLabel && (
                    <h3 className="text-sm font-medium line-clamp-1 text-foreground">
                      {note.label}
                    </h3>
                  )}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="text-sm line-clamp-6 leading-relaxed font-lora text-foreground/90">
                      <MarkdownRenderer content={note.content} compact />
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {note.category && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {note.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatShortDate(note.created_at)}
                    </span>
                  </div>
                </div>
              </button>
            }
          />
        );
      })}
    </div>
  );
}
