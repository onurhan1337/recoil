import { Archive, Check } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";

interface ArchivedFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
}

export function ArchivedFilter({
  filters,
  onFiltersChange,
}: ArchivedFilterProps) {
  return (
    <DropdownMenuItem
      onClick={() =>
        onFiltersChange((prev: NotesFiltersFromParsers) => ({
          ...prev,
          archived: prev.archived === true ? null : true,
        }))
      }
      className="px-2 py-2"
    >
      <Archive
        className={`h-4 w-4 mr-2 ${
          filters.archived === true ? "text-primary" : ""
        }`}
      />
      <Check
        className={`h-4 w-4 mr-2 ${
          filters.archived === true ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className={filters.archived === true ? "font-medium" : ""}>
        Archived
      </span>
    </DropdownMenuItem>
  );
}
