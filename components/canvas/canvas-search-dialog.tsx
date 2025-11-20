"use client";

import { useMemo } from "react";
import { useQueryState } from "nuqs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { CANVAS_FILTER_CONFIG } from "@/lib/canvas/filters";
import type { CanvasNote } from "@/lib/canvas/types";

interface CanvasSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: CanvasNote[];
  onSelectNote: (noteId: string) => void;
}

export function CanvasSearchDialog({
  open,
  onOpenChange,
  notes,
  onSelectNote,
}: CanvasSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    CANVAS_FILTER_CONFIG.search.parser.withOptions({ shallow: false })
  );

  const filteredNotes = useMemo(() => {
    return CANVAS_FILTER_CONFIG.search.filter(notes, searchQuery);
  }, [searchQuery, notes]);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Notes</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border rounded-md px-3 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => void setSearchQuery(e.target.value)}
            placeholder="Search by title, content, tags, or category..."
            className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No notes found
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm mb-1">
                  {note.title || note.label || "Untitled"}
                </div>
                {note.category && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Category: {note.category}
                  </div>
                )}
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {note.content}
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
