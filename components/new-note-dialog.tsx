"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NoteInput } from "@/components/note-input";

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewNoteDialog({ open, onOpenChange }: NewNoteDialogProps) {
  const handleNoteCreated = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Note</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Capture your thoughts and ideas</p>
        </DialogHeader>
        <div className="mt-6">
          <NoteInput onNoteCreated={handleNoteCreated} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
