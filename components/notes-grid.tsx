"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteCardWithContextMenu } from "@/components/note-card-with-context-menu";
import { formatShortDate } from "@/lib/utils";
import { Pin } from "lucide-react";
import type { Note } from "@/lib/api/types";

interface NotesGridProps {
  notes: Note[];
  pinnedCount: number;
  selectedNoteIds?: Set<string>;
  onNoteSelect?: (noteId: string, selected: boolean) => void;
  onNoteDeleted?: () => void;
}

export function NotesGrid({
  notes,
  pinnedCount,
  selectedNoteIds = new Set(),
  onNoteSelect,
  onNoteDeleted,
}: NotesGridProps) {
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

  const getNoteDisplayTitle = (note: Note): string | null => {
    if (note.title) return note.title;
    if (note.label && !isLabelRedundant(note.label, note.content)) {
      return note.label;
    }
    return null;
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const hasSelectedNotes = selectedNoteIds.size > 0;

  const handleCardClick = (e: React.MouseEvent, noteId: string) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isModifierPressed = isMac ? e.metaKey : e.ctrlKey;

    if (isModifierPressed && onNoteSelect) {
      e.preventDefault();
      e.stopPropagation();
      const isSelected = selectedNoteIds.has(noteId);
      onNoteSelect(noteId, !isSelected);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {sortedNotes.map((note, index) => {
        const displayTitle = getNoteDisplayTitle(note);

        return (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
              delay: index * 0.02,
            }}
            className="min-w-0 w-full"
          >
            {hasSelectedNotes ? (
              <div
                onClick={(e) => handleCardClick(e, note.id)}
                className={`group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 cursor-pointer w-full min-w-0 h-[180px] ${
                  selectedNoteIds.has(note.id)
                    ? "border-orange-500/60 bg-orange-500/5 hover:bg-orange-500/10"
                    : note.pinned
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                }`}
                style={
                  selectedNoteIds.has(note.id)
                    ? {
                        backgroundImage: `repeating-linear-gradient(
                          135deg,
                          transparent,
                          transparent 8px,
                          rgba(249, 115, 22, 0.08) 8px,
                          rgba(249, 115, 22, 0.08) 10px
                        )`,
                      }
                    : undefined
                }
              >
                {note.pinned && (
                  <div className="absolute top-2 right-2">
                    <Pin className="h-4 w-4 text-primary fill-primary" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
                  {displayTitle && (
                    <h3 className="text-sm font-medium line-clamp-1 text-foreground min-w-0 truncate">
                      {displayTitle}
                    </h3>
                  )}
                  <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                    <div className="text-sm line-clamp-2 leading-relaxed font-lora text-foreground/90 break-words overflow-hidden">
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
              </div>
            ) : (
              <NoteCardWithContextMenu
                note={note}
                pinnedCount={pinnedCount}
                showLabel={!!displayTitle}
                displayTitle={displayTitle}
                selectedNoteIds={selectedNoteIds}
                onNoteSelect={onNoteSelect}
                onNoteDeleted={onNoteDeleted}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
