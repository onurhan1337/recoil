import { Calendar, Tag as TagIcon, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteConnections } from "./note-connections";
import { NoteActionsDropdown } from "./note-actions-dropdown";
import { formatShortDate } from "@/lib/utils";
import type { Note } from "@/lib/api/types";
import type { NoteConnection } from "@/lib/api/hooks/use-note-connections";

interface NoteViewModeProps {
  note: Note;
  isPro: boolean;
  canPin: boolean;
  connections: NoteConnection[];
  connectionsLoading: boolean;
  isPinPending: boolean;
  isFavoritePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPinToggle: () => void;
  onFavoriteToggle: () => void;
  onConnectionClick: (connectionId: string) => void;
}

export function NoteViewMode({
  note,
  isPro,
  canPin,
  connections,
  connectionsLoading,
  isPinPending,
  isFavoritePending,
  onEdit,
  onDelete,
  onPinToggle,
  onFavoriteToggle,
  onConnectionClick,
}: NoteViewModeProps) {
  return (
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

        {isPro && (
          <NoteConnections
            connections={connections}
            isLoading={connectionsLoading}
            onConnectionClick={onConnectionClick}
          />
        )}

        <div className="space-y-2 pt-4 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Metadata
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Note ID:</span>
              <p className="font-mono text-[10px] mt-1 break-all">{note.id}</p>
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
        <Button variant="outline" onClick={onDelete} className="mr-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <NoteActionsDropdown
          isPinned={note.pinned || false}
          isFavorite={note.favorite || false}
          canPin={canPin}
          isPinPending={isPinPending}
          isFavoritePending={isFavoritePending}
          onPinToggle={onPinToggle}
          onFavoriteToggle={onFavoriteToggle}
        />
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogFooter>
    </>
  );
}
