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
  usePinnedNotesCount,
} from "@/lib/api/hooks";
import type { Note } from "@/lib/api/types";
import { isProPlan } from "@/lib/api/utils";

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
  const [editedTags, setEditedTags] = useState<string[]>(note.tags || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();
  const pinNoteMutation = usePinNote();
  const favoriteNoteMutation = useFavoriteNote();
  const pinnedCount = usePinnedNotesCount();
  const { data: usage } = useUsage();

  const isPro = isProPlan(usage?.plan);
  const canPin = note.pinned || pinnedCount < 3;

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
        tags: editedTags,
      });
      toast.success("Note saved successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update note"
      );
    }
  }, [editedContent, editedTags, note.id, updateNoteMutation]);

  const resetEditing = useCallback(() => {
    setEditedContent(note.content);
    setEditedTags(note.tags || []);
    setIsEditing(false);
    setIsPreview(false);
  }, [note.content, note.tags]);

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
      if (errorMessage.includes("Maximum of 3 pinned notes")) {
        toast.error(
          "Maximum of 3 pinned notes allowed. Unpin another note first."
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
    setEditedTags(note.tags || []);
    setIsEditing(true);
    setIsPreview(false);
  }, [note.content, note.tags]);

  return {
    isEditing,
    startEditing,
    editedContent,
    setEditedContent,
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
    handleDelete,
    handleUpdate,
    resetEditing,
    handlePinToggle,
    handleFavoriteToggle,
    handleConnectionClick,
  };
}
