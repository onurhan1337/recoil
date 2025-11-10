"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NoteViewMode } from "./note-view-mode";
import { NoteEditMode } from "./note-edit-mode";
import { NoteDeleteConfirm } from "./note-delete-confirm";
import { formatShortDate } from "@/lib/utils";
import { useNoteDialog } from "@/lib/hooks/use-note-dialog";
import type { Note } from "@/lib/api/types";

interface NoteDetailsDialogProps {
  note: Note;
  trigger?: React.ReactNode;
}

export function NoteDetailsDialog({ note, trigger }: NoteDetailsDialogProps) {
  const [open, setOpen] = useState<boolean>(false);

  const {
    isEditing,
    startEditing,
    editedContent,
    setEditedContent,
    editedTitle,
    setEditedTitle,
    editedTags,
    setEditedTags,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isPreview,
    setIsPreview,
    isPro,
    canPin,
    costEstimate,
    connections,
    connectionsLoading,
    deleteNoteMutation,
    updateNoteMutation,
    pinNoteMutation,
    favoriteNoteMutation,
    archiveNoteMutation,
    handleDelete,
    handleUpdate,
    resetEditing,
    handlePinToggle,
    handleFavoriteToggle,
    handleArchiveToggle,
    handleConnectionClick,
  } = useNoteDialog({ note, open, onOpenChange: setOpen });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View details
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex-1 min-w-0">
            {(note.title || note.label) && (
              <DialogTitle className="text-xl font-semibold mb-2 line-clamp-2">
                {note.title || note.label}
              </DialogTitle>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {note.category && (
                <Badge variant="secondary" className="text-xs">
                  {note.category}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatShortDate(note.created_at)}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {showDeleteConfirm ? (
          <NoteDeleteConfirm
            isPending={deleteNoteMutation.isPending}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
          />
        ) : isEditing ? (
          <NoteEditMode
            note={note}
            editedContent={editedContent}
            editedTitle={editedTitle}
            editedTags={editedTags}
            isPreview={isPreview}
            costEstimate={costEstimate}
            isPending={updateNoteMutation.isPending}
            onContentChange={setEditedContent}
            onTitleChange={setEditedTitle}
            onTagsChange={setEditedTags}
            onPreviewToggle={setIsPreview}
            onCancel={resetEditing}
            onSave={handleUpdate}
          />
        ) : (
          <NoteViewMode
            note={note}
            isPro={isPro}
            canPin={canPin}
            connections={connections}
            connectionsLoading={connectionsLoading}
            isPinPending={pinNoteMutation.isPending}
            isFavoritePending={favoriteNoteMutation.isPending}
            isArchivePending={archiveNoteMutation.isPending}
            onEdit={startEditing}
            onDelete={() => setShowDeleteConfirm(true)}
            onPinToggle={handlePinToggle}
            onFavoriteToggle={handleFavoriteToggle}
            onArchiveToggle={handleArchiveToggle}
            onConnectionClick={handleConnectionClick}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
