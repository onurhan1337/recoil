import { useState } from "react";
import { Library, Plus, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCollections,
  useAddNoteToCollection,
  useRemoveNoteFromCollection,
} from "@/lib/api/hooks/use-collections";
import { useNotesWithCollections } from "@/lib/api/hooks/use-notes";
import { toast } from "sonner";

interface NoteCollectionsManagerProps {
  noteId: string;
}

export function NoteCollectionsManager({
  noteId,
}: NoteCollectionsManagerProps) {
  const { data: allCollections = [], isLoading: collectionsLoading } =
    useCollections();
  const { data: notes = [] } = useNotesWithCollections();
  const addNoteToCollection = useAddNoteToCollection();
  const removeNoteFromCollection = useRemoveNoteFromCollection();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const currentNote = notes.find((n) => n.id === noteId);
  const noteCollections = currentNote?.collections || [];

  const handleAddToCollection = async (collectionId: string) => {
    setPendingAction(collectionId);
    try {
      await addNoteToCollection.mutateAsync({ collectionId, noteId });
      toast.success("Added to collection");
    } catch (error) {
      toast.error("Failed to add to collection");
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemoveFromCollection = async (collectionId: string) => {
    setPendingAction(collectionId);
    try {
      await removeNoteFromCollection.mutateAsync({ collectionId, noteId });
      toast.success("Removed from collection");
    } catch (error) {
      toast.error("Failed to remove from collection");
    } finally {
      setPendingAction(null);
    }
  };

  const availableCollections = allCollections.filter(
    (collection) => !noteCollections.some((nc) => nc.id === collection.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          <span>Collections</span>
        </div>
        {availableCollections.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableCollections.map((collection) => (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => handleAddToCollection(collection.id)}
                  disabled={pendingAction === collection.id}
                >
                  {pendingAction === collection.id ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: collection.color || "#gray" }}
                    />
                  )}
                  {collection.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {collectionsLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </div>
        ) : noteCollections.length === 0 ? (
          <p className="text-xs text-muted-foreground">Not in any collection</p>
        ) : (
          noteCollections.map((collection) => (
            <Badge
              key={collection.id}
              variant="outline"
              className="text-xs flex items-center gap-1 bg-muted"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: collection.color || "#gray" }}
              />
              {collection.name}
              <button
                onClick={() => handleRemoveFromCollection(collection.id)}
                disabled={pendingAction === collection.id}
                className="ml-1 hover:text-destructive"
              >
                {pendingAction === collection.id ? (
                  <Loader2 className="h-2 w-2 animate-spin" />
                ) : (
                  <X className="h-2 w-2" />
                )}
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
