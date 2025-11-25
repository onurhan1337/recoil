"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCollections,
  useBulkAddNotesToCollection,
  useBulkRemoveNotesFromCollection,
} from "@/lib/api/hooks/use-collections";
import { toast } from "sonner";
import { FolderPlus, FolderMinus, Loader2, Folder } from "lucide-react";
import type { Collection } from "@/lib/api/types";

interface BulkCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNoteIds: string[];
  onSuccess?: () => void;
}

export function BulkCollectionDialog({
  open,
  onOpenChange,
  selectedNoteIds,
  onSuccess,
}: BulkCollectionDialogProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [action, setAction] = useState<"add" | "remove">("add");

  const { data: collections = [] } = useCollections();
  const bulkAdd = useBulkAddNotesToCollection();
  const bulkRemove = useBulkRemoveNotesFromCollection();

  const handleSubmit = async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection");
      return;
    }

    try {
      if (action === "add") {
        const result = await bulkAdd.mutateAsync({
          collectionId: selectedCollection,
          noteIds: selectedNoteIds,
        });

        if (result.message) {
          toast.info(result.message);
        } else if (result.skippedCount && result.skippedCount > 0) {
          toast.success(
            `Added ${result.addedCount} note${
              result.addedCount !== 1 ? "s" : ""
            } to collection (${result.skippedCount} already in collection)`
          );
        } else {
          toast.success(
            `Added ${result.addedCount} note${
              result.addedCount !== 1 ? "s" : ""
            } to collection`
          );
        }
      } else {
        const result = await bulkRemove.mutateAsync({
          collectionId: selectedCollection,
          noteIds: selectedNoteIds,
        });
        toast.success(
          `Removed ${result.removedCount} note${
            result.removedCount !== 1 ? "s" : ""
          } from collection`
        );
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleClose = () => {
    setSelectedCollection(null);
    setAction("add");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
          <DialogDescription>
            Add or remove {selectedNoteIds.length} note
            {selectedNoteIds.length !== 1 ? "s" : ""} from a collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 w-full">
            <Button
              variant={action === "add" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("add")}
              className="flex-1 cursor-pointer"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Add to Collection
            </Button>
            <Button
              variant={action === "remove" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("remove")}
              className="flex-1"
            >
              <FolderMinus className="h-4 w-4 mr-2" />
              Remove from Collection
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Collection</label>
            {collections.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No collections available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a collection first
                </p>
              </div>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection.id)}
                    className={`text-left p-3 rounded-md border transition-colors ${
                      selectedCollection === collection.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {collection.name}
                        </h4>
                        {collection.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {collection.description}
                          </p>
                        )}
                      </div>
                      {collection.color && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: collection.color }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedCollection ||
                collections.length === 0 ||
                bulkAdd.isPending ||
                bulkRemove.isPending
              }
            >
              {bulkAdd.isPending || bulkRemove.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === "add" ? (
                    <FolderPlus className="h-4 w-4 mr-2" />
                  ) : (
                    <FolderMinus className="h-4 w-4 mr-2" />
                  )}
                  {action === "add" ? "Add" : "Remove"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
