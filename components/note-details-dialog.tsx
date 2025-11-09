"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Tag as TagIcon,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Loader2,
  Info,
  Save,
  X,
  Pin,
  PinOff,
  Heart,
  HeartOff,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TagInput } from "@/components/tag-input";
import { formatShortDate } from "@/lib/utils";
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
import { toast } from "sonner";
import type { Note } from "@/lib/api/types";

interface NoteDetailsDialogProps {
  note: Note;
  trigger?: React.ReactNode;
}

export function NoteDetailsDialog({ note, trigger }: NoteDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedTags, setEditedTags] = useState<string[]>(note.tags || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditedContent(note.content);
    setEditedTags(note.tags || []);
  }, [note]);

  const deleteNoteMutation = useDeleteNote();
  const updateNoteMutation = useUpdateNote();
  const pinNoteMutation = usePinNote();
  const favoriteNoteMutation = useFavoriteNote();
  const pinnedCount = usePinnedNotesCount();
  const { data: usage } = useUsage();
  const isPro = usage?.plan === "pro";
  const { data: costEstimate } = useEstimateNoteCost(
    isEditing ? editedContent : ""
  );
  const { data: connections = [], isLoading: connectionsLoading } =
    useNoteConnections(open && isPro ? note.id : null);

  const canPin = note.pinned || pinnedCount < 3;

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync(note.id);
      toast.success("Note deleted successfully");
      setOpen(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete note"
      );
    }
  };

  const handleUpdate = async () => {
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
      toast.success("Note updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update note"
      );
    }
  };

  const resetEditing = () => {
    setEditedContent(note.content);
    setEditedTags(note.tags || []);
    setIsEditing(false);
  };

  const handlePinToggle = async () => {
    try {
      await pinNoteMutation.mutateAsync({
        noteId: note.id,
        pinned: !note.pinned,
      });
      toast.success(note.pinned ? "Note unpinned" : "Note pinned");
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
  };

  const handleFavoriteToggle = async () => {
    try {
      await favoriteNoteMutation.mutateAsync({
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
            {note.label && (
              <DialogTitle className="text-xl font-semibold mb-2 line-clamp-2">
                {note.label}
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
          <>
            <div className="py-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <h3 className="font-semibold text-sm mb-2">Delete Note?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this note? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteNoteMutation.isPending}
              >
                {deleteNoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : isEditing ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Edit Content
                </label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Note content..."
                />
              </div>

              <TagInput value={editedTags} onChange={setEditedTags} />

              {costEstimate &&
                editedContent.trim() &&
                editedContent !== note.content && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <Info className="h-3 w-3" />
                    <span>
                      Update cost:{" "}
                      <strong className="text-foreground">
                        {costEstimate.estimated_cost}
                      </strong>{" "}
                      credits
                      {costEstimate.embedding_cost > 0 && (
                        <span className="ml-1">
                          ({costEstimate.base_cost} base +{" "}
                          {costEstimate.embedding_cost} vectorizing)
                        </span>
                      )}
                    </span>
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetEditing}
                disabled={updateNoteMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateNoteMutation.isPending || !editedContent.trim()}
              >
                {updateNoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <span>Content</span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={note.content} />
                  </div>
                </div>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <TagIcon className="h-4 w-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {isPro ? (
                connectionsLoading ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <span>Connected Notes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Finding connections...</span>
                    </div>
                  </div>
                ) : connections.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <span>Connected Notes</span>
                    </div>
                    <div className="space-y-2">
                      {connections.map((connection) => (
                        <button
                          key={connection.id}
                          onClick={() => {
                            setOpen(false);
                            setTimeout(() => {
                              const element = document.querySelector(
                                `[data-note-id="${connection.id}"]`
                              );
                              element?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            }, 100);
                          }}
                          className="w-full text-left rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            {connection.label && (
                              <p className="text-xs font-medium line-clamp-1">
                                {connection.label}
                              </p>
                            )}
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {Math.round(connection.similarity * 100)}% match
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {connection.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {connection.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5"
                              >
                                {connection.category}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatShortDate(connection.created_at)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              ) : null}

              <div className="space-y-2 pt-4 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Metadata
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Note ID:</span>
                    <p className="font-mono text-[10px] mt-1 break-all">
                      {note.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={
                      pinNoteMutation.isPending ||
                      favoriteNoteMutation.isPending
                    }
                  >
                    <MoreVertical className="h-4 w-4 mr-2" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPin && (
                    <DropdownMenuItem
                      onClick={handlePinToggle}
                      disabled={pinNoteMutation.isPending}
                    >
                      {pinNoteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : note.pinned ? (
                        <PinOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Pin className="h-4 w-4 mr-2" />
                      )}
                      {note.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleFavoriteToggle}
                    disabled={favoriteNoteMutation.isPending}
                  >
                    {favoriteNoteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : note.favorite ? (
                      <HeartOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
                    {note.favorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
