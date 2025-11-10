import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useDeleteNote,
  useUpdateNote,
  useEstimateNoteCost,
  useNoteConnections,
  useUsage,
  usePinNote,
  useFavoriteNote,
  useArchiveNote,
  usePinnedNotesCount,
} from "@/lib/api/hooks";
import type { Note } from "@/lib/api/types";
import { isProPlan } from "@/lib/api/utils";

const MAX_PINNED_NOTES = 3;

interface UseNoteDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function useNoteDialog({
  note,
  open,
  onOpenChange,
}: UseNoteDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedTitle, setEditedTitle] = useState(note.title || "");
  const [editedTags, setEditedTags] = useState<string[]>(note.tags || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();
  const pinNoteMutation = usePinNote();
  const favoriteNoteMutation = useFavoriteNote();
  const archiveNoteMutation = useArchiveNote();
  const pinnedCount = usePinnedNotesCount();
  const { data: usage } = useUsage();

  const isPro = isProPlan(usage?.plan);
  const canPin = note.pinned || pinnedCount < MAX_PINNED_NOTES;

  const { data: costEstimate } = useEstimateNoteCost(
    isEditing && open ? editedContent : ""
  );

  const { data: connections = [], isLoading: connectionsLoading } =
    useNoteConnections(open && isPro ? note.id : null);

  const handleDelete = useCallback(async () => {
    try {
      await deleteNoteMutation.mutateAsync(note.id);
      toast.success("Note removed successfully");
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete note"
      );
    }
  }, [deleteNoteMutation, note.id, onOpenChange]);

  const handleUpdate = useCallback(async () => {
    if (!editedContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      await updateNoteMutation.mutateAsync({
        noteId: note.id,
        content: editedContent,
        title: editedTitle.trim() || undefined,
        tags: editedTags,
      });
      toast.success("Note saved successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update note"
      );
    }
  }, [editedContent, editedTitle, editedTags, note.id, updateNoteMutation]);

  const resetEditing = useCallback(() => {
    setEditedContent(note.content);
    setEditedTitle(note.title || "");
    setEditedTags(note.tags || []);
    setIsEditing(false);
    setIsPreview(false);
  }, [note.content, note.title, note.tags]);

  const handlePinToggle = useCallback(async () => {
    try {
      await pinNoteMutation.mutateAsync({
        noteId: note.id,
        pinned: !note.pinned,
      });
      toast.success(
        note.pinned ? "Note unpinned successfully" : "Note pinned successfully"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle pin";
      if (
        errorMessage.includes(
          `Maximum of ${MAX_PINNED_NOTES} pinned notes allowed.`
        )
      ) {
        toast.error(
          `Maximum of ${MAX_PINNED_NOTES} pinned notes allowed. Unpin another note first.`
        );
      } else {
        toast.error(errorMessage);
      }
    }
  }, [note.id, note.pinned, pinNoteMutation]);

  const handleFavoriteToggle = useCallback(async () => {
    try {
      await favoriteNoteMutation.mutateAsync({
        noteId: note.id,
        favorite: !note.favorite,
      });
      toast.success(
        note.favorite
          ? "Removed from favorites successfully"
          : "Added to favorites successfully"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle favorite"
      );
    }
  }, [favoriteNoteMutation, note.favorite, note.id]);

  const handleArchiveToggle = useCallback(async () => {
    try {
      await archiveNoteMutation.mutateAsync({
        noteId: note.id,
        archived: !note.archived,
      });
      toast.success(
        note.archived
          ? "Note unarchived successfully"
          : "Note archived successfully"
      );
      if (!note.archived) {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle archive"
      );
    }
  }, [archiveNoteMutation, note.archived, note.id, onOpenChange]);

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      onOpenChange(false);
      setTimeout(() => {
        const element = document.querySelector(
          `[data-note-id="${connectionId}"]`
        );
        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    },
    [onOpenChange]
  );

  const startEditing = useCallback(() => {
    setEditedContent(note.content);
    setEditedTitle(note.title || "");
    setEditedTags(note.tags || []);
    setIsEditing(true);
    setIsPreview(false);
  }, [note.content, note.title, note.tags]);

  return {
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
  };
}
