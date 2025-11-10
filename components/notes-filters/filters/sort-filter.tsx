import { ArrowUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface SortFilterProps {
  filters: NotesFilters;
  onFiltersChange: (filters: (prev: NotesFilters) => NotesFilters) => void;
}

const SORT_OPTIONS = [
  { value: "newest" as const, label: "Newest first" },
  { value: "oldest" as const, label: "Oldest first" },
  { value: "category" as const, label: "By category" },
];

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
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
            {filters.sortBy === "oldest" ? "Oldest" : "Category"}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        {SORT_OPTIONS.map((sort) => (
          <DropdownMenuItem
            key={sort.value}
            onClick={() =>
              onFiltersChange((prev) => ({ ...prev, sortBy: sort.value }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.sortBy === sort.value ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className={filters.sortBy === sort.value ? "font-medium" : ""}>
              {sort.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
