import {
  MoreVertical,
  Pin,
  PinOff,
  Heart,
  HeartOff,
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
  canPin: boolean;
  isPinPending: boolean;
  isFavoritePending: boolean;
  onPinToggle: () => void;
  onFavoriteToggle: () => void;
}

export function NoteActionsDropdown({
  isPinned,
  isFavorite,
  canPin,
  isPinPending,
  isFavoritePending,
  onPinToggle,
  onFavoriteToggle,
}: NoteActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPinPending || isFavoritePending}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
