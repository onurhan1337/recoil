"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteDetailsDialog } from "@/components/note-details-dialog";
import { ReminderDialog } from "@/components/reminder";
import { formatShortDate } from "@/lib/utils";
import {
  Pin,
  PinOff,
  Heart,
  HeartOff,
  Archive,
  ArchiveRestore,
  Copy,
  Trash2,
  Loader2,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePinNote,
  useFavoriteNote,
  useArchiveNote,
  useDuplicateNote,
  useDeleteNote,
} from "@/lib/api/hooks/use-notes";
import type { Note } from "@/lib/api/types";

interface NoteCardWithContextMenuProps {
  note: Note;
  pinnedCount: number;
  showLabel: boolean;
  selectedNoteIds?: Set<string>;
  onNoteSelect?: (noteId: string, selected: boolean) => void;
  onNoteDeleted?: () => void;
}

function NoteCardWithContextMenu({
  note,
  pinnedCount,
  showLabel,
  selectedNoteIds = new Set(),
  onNoteSelect,
  onNoteDeleted,
}: NoteCardWithContextMenuProps) {
  const pinNote = usePinNote();
  const favoriteNote = useFavoriteNote();
  const archiveNote = useArchiveNote();
  const duplicateNote = useDuplicateNote();
  const deleteNote = useDeleteNote();

  const canPin = note.pinned || pinnedCount < 3;

  const handlePinToggle = async () => {
    try {
      await pinNote.mutateAsync({
        noteId: note.id,
        pinned: !note.pinned,
      });
      toast.success(note.pinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle pin"
      );
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      await favoriteNote.mutateAsync({
        noteId: note.id,
        favorite: !note.favorite,
      });
      toast.success(
        note.favorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle favorite"
      );
    }
  };

  const handleArchiveToggle = async () => {
    try {
      await archiveNote.mutateAsync({
        noteId: note.id,
        archived: !note.archived,
      });
      toast.success(note.archived ? "Note unarchived" : "Note archived");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle archive"
      );
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateNote.mutateAsync(note.id);
      toast.success("Note duplicated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate note"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success("Note deleted");
      onNoteDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete note"
      );
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="w-full">
          <NoteDetailsDialog
            note={note}
            pinnedCount={pinnedCount}
            trigger={
              <button
                data-note-id={note.id}
                onClick={(e) => {
                  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
                  const isModifierPressed = isMac ? e.metaKey : e.ctrlKey;
                  if (isModifierPressed && onNoteSelect) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isSelected = selectedNoteIds.has(note.id);
                    onNoteSelect(note.id, !isSelected);
                    return;
                  }
                }}
                className={`group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 text-left w-full h-[180px] ${
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
                    <div className="text-sm line-clamp-2 leading-relaxed font-lora text-foreground/90">
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
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {canPin && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handlePinToggle();
            }}
            disabled={pinNote.isPending}
          >
            {pinNote.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : note.pinned ? (
              <PinOff className="h-4 w-4 mr-2" />
            ) : (
              <Pin className="h-4 w-4 mr-2" />
            )}
            {note.pinned ? "Unpin" : "Pin"}
          </ContextMenuItem>
        )}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle();
          }}
          disabled={favoriteNote.isPending}
        >
          {favoriteNote.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : note.favorite ? (
            <HeartOff className="h-4 w-4 mr-2" />
          ) : (
            <Heart className="h-4 w-4 mr-2" />
          )}
          {note.favorite ? "Unfavorite" : "Favorite"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleArchiveToggle();
          }}
          disabled={archiveNote.isPending}
        >
          {archiveNote.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : note.archived ? (
            <ArchiveRestore className="h-4 w-4 mr-2" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          {note.archived ? "Unarchive" : "Archive"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ReminderDialog
          noteId={note.id}
          trigger={
            <ContextMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </ContextMenuItem>
          }
        />
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicate();
          }}
          disabled={duplicateNote.isPending}
        >
          {duplicateNote.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Duplicate
        </ContextMenuItem>
        {onNoteSelect && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              const isSelected = selectedNoteIds.has(note.id);
              onNoteSelect(note.id, !isSelected);
            }}
          >
            <Checkbox
              checked={selectedNoteIds.has(note.id)}
              className="h-4 w-4 mr-2"
            />
            {selectedNoteIds.has(note.id) ? "Deselect" : "Select"}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleteNote.isPending}
        >
          {deleteNote.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { NoteCardWithContextMenu };

