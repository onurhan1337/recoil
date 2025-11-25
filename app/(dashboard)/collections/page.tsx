"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Library, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import {
  useCollections,
  useDeleteCollection,
} from "@/lib/api/hooks/use-collections";
import { useNotesWithCollections } from "@/lib/api/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewCollectionDialog } from "@/components/new-collection-dialog";
import { EditCollectionDialog } from "@/components/edit-collection-dialog";
import { NotesGrid } from "@/components/notes-grid";
import type { Collection } from "@/lib/api/types";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { data: collections = [], isLoading: collectionsLoading } =
    useCollections();
  const { data: allNotes = [], isLoading: notesLoading } =
    useNotesWithCollections();
  const deleteCollection = useDeleteCollection();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );

  const handleDelete = async (collectionId: string) => {
    try {
      await deleteCollection.mutateAsync(collectionId);
      toast.success("Collection deleted successfully");
      if (selectedCollection === collectionId) {
        setSelectedCollection(null);
      }
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  const getNotesInCollection = (collectionId: string) => {
    return allNotes.filter((note) =>
      note.collections?.some((c) => c.id === collectionId)
    );
  };

  const selectedCollectionData = collections.find(
    (c) => c.id === selectedCollection
  );
  const selectedNotes = selectedCollection
    ? getNotesInCollection(selectedCollection)
    : [];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
            Collections
          </h1>
          <p className="text-muted-foreground tracking-wide font-lora text-sm">
            Organize your notes into collections
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      {collectionsLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <Library className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            No collections yet. Create your first collection to organize your
            notes.
          </p>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => {
            const noteCount = getNotesInCollection(collection.id).length;
            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                  delay: index * 0.02,
                }}
              >
                <div
                  className={`group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 text-left w-full cursor-pointer ${
                    selectedCollection === collection.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    <div className="flex items-start gap-2">
                      <div
                        className="p-2 rounded-md border shrink-0"
                        style={{
                          backgroundColor: collection.color
                            ? `${collection.color}1A`
                            : "rgb(249 115 22 / 0.1)",
                          borderColor: collection.color || "rgb(249 115 22)",
                        }}
                      >
                        <Library
                          className="h-4 w-4"
                          style={{
                            color: collection.color || "rgb(234 88 12)",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium line-clamp-1 text-foreground mb-1">
                          {collection.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs mb-1.5">
                          {noteCount} {noteCount === 1 ? "note" : "notes"}
                        </Badge>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-lora">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto pt-2 border-t flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollection(collection);
                        }}
                        className="flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id);
                        }}
                        disabled={deleteCollection.isPending}
                      >
                        {deleteCollection.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedCollection && selectedCollectionData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-lora font-semibold tracking-tight mb-2">
              {selectedCollectionData.name}
            </h2>
            <Button
              variant="link"
              className="font-lora cursor-pointer"
              onClick={() => setSelectedCollection(null)}
            >
              Close
            </Button>
          </div>
          {notesLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
            </div>
          ) : selectedNotes.length === 0 ? (
            <div className="rounded-md border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No notes in this collection yet.
              </p>
            </div>
          ) : (
            <NotesGrid notes={selectedNotes} pinnedCount={0} />
          )}
        </div>
      )}

      <NewCollectionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
      />

      {editingCollection && (
        <EditCollectionDialog
          collection={editingCollection}
          open={!!editingCollection}
          onOpenChange={(open) => !open && setEditingCollection(null)}
        />
      )}
    </div>
  );
}
