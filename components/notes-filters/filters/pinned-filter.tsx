import { Pin, Check } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface PinnedFilterProps {
  filters: NotesFilters;
  onFiltersChange: (filters: (prev: NotesFilters) => NotesFilters) => void;
}

export function PinnedFilter({ filters, onFiltersChange }: PinnedFilterProps) {
  return (
    <DropdownMenuItem
      onClick={() =>
        onFiltersChange((prev) => ({
          ...prev,
          pinned: prev.pinned === true ? undefined : true,
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
