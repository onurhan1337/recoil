import { Calendar, Tag as TagIcon, Pencil, Trash2, Library, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NoteConnections } from "./note-connections";
import { NoteActionsDropdown } from "./note-actions-dropdown";
import { NoteCollectionsManager } from "./note-collections-manager";
import { ReminderDialog } from "@/components/reminder-dialog";
import { useReminders } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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
  isArchivePending: boolean;
  isDuplicatePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPinToggle: () => void;
  onFavoriteToggle: () => void;
  onArchiveToggle: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
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
  isArchivePending,
  isDuplicatePending,
  onEdit,
  onDelete,
  onPinToggle,
  onFavoriteToggle,
  onArchiveToggle,
  onDuplicate,
  onSaveAsTemplate,
  onConnectionClick,
}: NoteViewModeProps) {
  const { data: remindersData, refetch: refetchReminders } = useReminders(note.id);
  const reminders = remindersData || [];
  const activeReminder = reminders.find((r) => !r.sent);

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

        <NoteCollectionsManager noteId={note.id} />

        {activeReminder && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>Reminder</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {new Date(activeReminder.reminder_date).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activeReminder.reminder_date), {
                    addSuffix: true,
                  })}
                </p>
                <div className="flex gap-2 mt-1">
                  {activeReminder.email_enabled && (
                    <Badge variant="outline" className="text-xs">
                      Email
                    </Badge>
                  )}
                  {activeReminder.in_app_enabled && (
                    <Badge variant="outline" className="text-xs">
                      In-App
                    </Badge>
                  )}
                </div>
              </div>
              <ReminderDialog
                noteId={note.id}
                reminder={activeReminder}
                trigger={
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                }
                onSuccess={refetchReminders}
              />
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
        {!activeReminder && (
          <ReminderDialog
            noteId={note.id}
            trigger={
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            }
            onSuccess={refetchReminders}
          />
        )}
        <NoteActionsDropdown
          isPinned={note.pinned || false}
          isFavorite={note.favorite || false}
          isArchived={note.archived || false}
          canPin={canPin}
          isPinPending={isPinPending}
          isFavoritePending={isFavoritePending}
          isArchivePending={isArchivePending}
          isDuplicatePending={isDuplicatePending}
          onPinToggle={onPinToggle}
          onFavoriteToggle={onFavoriteToggle}
          onArchiveToggle={onArchiveToggle}
          onDuplicate={onDuplicate}
          onSaveAsTemplate={onSaveAsTemplate}
        />
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogFooter>
    </>
  );
}
