import {
  MoreVertical,
  Pin,
  PinOff,
  Heart,
  HeartOff,
  Archive,
  ArchiveRestore,
  Copy,
  FileText,
  Loader2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReminderDialog } from "@/components/reminder";
import type { Reminder } from "@/lib/api/types";

interface NoteActionsDropdownProps {
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  canPin: boolean;
  isPinPending: boolean;
  isFavoritePending: boolean;
  isArchivePending: boolean;
  isDuplicatePending: boolean;
  noteId: string;
  activeReminder: Reminder | undefined;
  onPinToggle: () => void;
  onFavoriteToggle: () => void;
  onArchiveToggle: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onReminderSuccess: () => void;
}

export function NoteActionsDropdown({
  isPinned,
  isFavorite,
  isArchived,
  canPin,
  isPinPending,
  isFavoritePending,
  isArchivePending,
  isDuplicatePending,
  noteId,
  activeReminder,
  onPinToggle,
  onFavoriteToggle,
  onArchiveToggle,
  onDuplicate,
  onSaveAsTemplate,
  onReminderSuccess,
}: NoteActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={
            isPinPending ||
            isFavoritePending ||
            isArchivePending ||
            isDuplicatePending
          }
        >
          <MoreVertical className="h-4 w-4 mr-2" />
          <span className="text-sm text-muted-foreground font-normal tracking-tight">
            Actions
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canPin && (
          <DropdownMenuItem onClick={onPinToggle} disabled={isPinPending}>
            {isPinPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isPinned ? (
              <PinOff className="h-4 w-4 mr-2" />
            ) : (
              <Pin className="h-4 w-4 mr-2" />
            )}
            {isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onFavoriteToggle}
          disabled={isFavoritePending}
        >
          {isFavoritePending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isFavorite ? (
            <HeartOff className="h-4 w-4 mr-2" />
          ) : (
            <Heart className="h-4 w-4 mr-2" />
          )}
          {isFavorite ? "Unfavorite" : "Favorite"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchiveToggle} disabled={isArchivePending}>
          {isArchivePending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isArchived ? (
            <ArchiveRestore className="h-4 w-4 mr-2" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          {isArchived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicatePending}>
          {isDuplicatePending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSaveAsTemplate}>
          <FileText className="h-4 w-4 mr-2" />
          Save as Template
        </DropdownMenuItem>
        <ReminderDialog
          noteId={noteId}
          reminder={activeReminder}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Bell className="h-4 w-4 mr-2" />
              {activeReminder ? "Edit Reminder" : "Set Reminder"}
            </DropdownMenuItem>
          }
          onSuccess={onReminderSuccess}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
