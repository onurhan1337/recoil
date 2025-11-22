"use client";

import { useState, useMemo } from "react";
import { useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
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
import { MarkdownRenderer } from "../markdown-renderer";
import { ScrollArea } from "../ui/scroll-area";

interface CanvasSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: CanvasNote[];
  onSelectNote: (noteId: string) => void;
}

const SEARCH_DEBOUNCE_DELAY = 300;

export function CanvasSearchDialog({
  open,
  onOpenChange,
  notes,
  onSelectNote,
}: CanvasSearchDialogProps) {
  const [searchQuery] = useQueryState(
    "search",
    CANVAS_FILTER_CONFIG.search.parser.withOptions({ shallow: false })
  );

  const [inputValue, setInputValue] = useState<string>(searchQuery ?? "");

  const [debouncedInputValue] = useDebounceValue(
    inputValue,
    SEARCH_DEBOUNCE_DELAY
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const filteredNotes = useMemo(() => {
    return CANVAS_FILTER_CONFIG.search.filter(notes, debouncedInputValue);
  }, [debouncedInputValue, notes]);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <span className="font-medium font-lora">Search Notes</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border rounded-md px-3 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search by title, content, tags, or category..."
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            autoFocus
          />
        </div>
        <ScrollArea>
          <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-4">
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
                  <div className="font-medium font-lora text-sm mb-1">
                    {note.title || note.label || "Untitled"}
                  </div>
                  {note.category && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Category: {note.category}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    <MarkdownRenderer content={note.content} compact />
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-lora italic rounded"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
