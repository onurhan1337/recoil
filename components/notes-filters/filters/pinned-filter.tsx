import { Pin, Check } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";

interface PinnedFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
}

export function PinnedFilter({ filters, onFiltersChange }: PinnedFilterProps) {
  return (
    <DropdownMenuItem
      onClick={() =>
        onFiltersChange((prev: NotesFiltersFromParsers) => ({
          ...prev,
          pinned: prev.pinned === true ? null : true,
        }))
      }
      className="px-2 py-2"
    >
      <Pin
        className={`h-4 w-4 mr-2 ${
          filters.pinned === true ? "text-primary" : ""
        }`}
      />
      <Check
        className={`h-4 w-4 mr-2 ${
          filters.pinned === true ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className={filters.pinned === true ? "font-medium" : ""}>
        Pinned
      </span>
    </DropdownMenuItem>
  );
}
