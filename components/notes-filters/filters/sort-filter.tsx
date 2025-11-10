import { ArrowUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";
import { SORT_OPTIONS } from "@/lib/filters/config";

interface SortFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
}

const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  category: "By category",
};

const SORT_ITEMS = SORT_OPTIONS.map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

export function SortFilter({ filters, onFiltersChange }: SortFilterProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-2 py-2">
        <ArrowUpDown
          className={`h-4 w-4 ${
            filters.sortBy !== "newest" ? "text-primary" : ""
          }`}
        />
        <span className={filters.sortBy !== "newest" ? "font-medium" : ""}>
          Sort
        </span>
        {filters.sortBy !== "newest" && (
          <Badge
            variant="secondary"
            className="ml-auto text-xs px-1.5 py-0 h-5"
          >
            {filters.sortBy === "oldest" ? "Oldest" : "Category"}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        {SORT_ITEMS.map((sort) => (
          <DropdownMenuItem
            key={sort.value}
            onClick={() =>
              onFiltersChange((prev: NotesFiltersFromParsers) => ({
                ...prev,
                sortBy: sort.value,
              }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.sortBy === sort.value ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={filters.sortBy === sort.value ? "font-medium" : ""}
            >
              {sort.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
