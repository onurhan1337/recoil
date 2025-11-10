import { Tag, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";

interface TagFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
  availableTags: string[];
}

export function TagFilter({
  filters,
  onFiltersChange,
  availableTags,
}: TagFilterProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-2 py-2">
        <Tag className={`h-4 w-4 ${filters.tag ? "text-primary" : ""}`} />
        <span className={filters.tag ? "font-medium" : ""}>Tag</span>
        {filters.tag && (
          <Badge
            variant="secondary"
            className="ml-auto text-xs px-1.5 py-0 h-5"
          >
            {filters.tag}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        <DropdownMenuItem
          onClick={() =>
            onFiltersChange((prev: NotesFiltersFromParsers) => ({
              ...prev,
              tag: null,
            }))
          }
          className="px-2 py-2"
        >
          <Check
            className={`h-4 w-4 mr-2 ${
              !filters.tag ? "opacity-100" : "opacity-0"
            }`}
          />
          <span className={!filters.tag ? "font-medium" : ""}>All tags</span>
        </DropdownMenuItem>
        {availableTags.map((tag) => (
          <DropdownMenuItem
            key={tag}
            onClick={() =>
              onFiltersChange((prev: NotesFiltersFromParsers) => ({
                ...prev,
                tag,
              }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.tag === tag ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className={filters.tag === tag ? "font-medium" : ""}>
              {tag}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
