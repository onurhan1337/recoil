"use client";

import { useState, useEffect } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCollection } from "@/lib/api/hooks/use-collections";
import type { Collection } from "@/lib/api/types";
import { toast } from "sonner";

interface EditCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  "#dc2626",
  "#d97706",
  "#facc15",
  "#84cc16",
  "#2563eb",
  "#9333ea",
  "#db2777",
  "#0891b2",
  "#000000",
];

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
}: EditCollectionDialogProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [color, setColor] = useState(collection.color || PRESET_COLORS[0]);
  const updateCollection = useUpdateCollection();

  useEffect(() => {
    setName(collection.name);
    setDescription(collection.description || "");
    setColor(collection.color || PRESET_COLORS[0]);
  }, [collection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    try {
      await updateCollection.mutateAsync({
        collectionId: collection.id,
        name,
        description,
        color,
      });
      toast.success("Collection updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update collection");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-lora">Edit Collection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this collection"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`h-7 w-7 rounded-full transition-all hover:ring-2 hover:ring-offset-1 hover:ring-foreground/30 ${
                    color === presetColor ? "ring-2 ring-offset-1 ring-foreground" : "ring-1 ring-border/50"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCollection.isPending}>
              {updateCollection.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
