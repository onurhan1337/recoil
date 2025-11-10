import {
  MoreVertical,
  Pin,
  PinOff,
  Heart,
  HeartOff,
  Archive,
  ArchiveRestore,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteActionsDropdownProps {
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  canPin: boolean;
  isPinPending: boolean;
  isFavoritePending: boolean;
  isArchivePending: boolean;
  onPinToggle: () => void;
  onFavoriteToggle: () => void;
  onArchiveToggle: () => void;
}

export function NoteActionsDropdown({
  isPinned,
  isFavorite,
  isArchived,
  canPin,
  isPinPending,
  isFavoritePending,
  isArchivePending,
  onPinToggle,
  onFavoriteToggle,
  onArchiveToggle,
}: NoteActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isPinPending || isFavoritePending || isArchivePending}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
