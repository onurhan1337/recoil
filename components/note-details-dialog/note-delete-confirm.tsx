import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface NoteDeleteConfirmProps {
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NoteDeleteConfirm({
  isPending,
  onCancel,
  onConfirm,
}: NoteDeleteConfirmProps) {
  return (
    <>
      <div className="py-8">
        <div className="text-center space-y-3 max-w-sm mx-auto">
          <h3 className="text-xl font-semibold tracking-tight">
            Remove this note?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Once removed, this note won't be available in your collection
            anymore. You can always create a new one if you change your mind.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Keep it
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
          className="bg-destructive text-white hover:bg-destructive/90"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
