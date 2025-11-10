import { Folder, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface CategoryFilterProps {
  filters: NotesFilters;
  onFiltersChange: (filters: (prev: NotesFilters) => NotesFilters) => void;
  availableCategories: string[];
}

export function CategoryFilter({
  filters,
  onFiltersChange,
  availableCategories,
}: CategoryFilterProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-2 py-2">
        <Folder
          className={`h-4 w-4 ${filters.category ? "text-primary" : ""}`}
        />
        <span className={filters.category ? "font-medium" : ""}>Category</span>
        {filters.category && (
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
            {filters.category}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        <DropdownMenuItem
          onClick={() =>
            onFiltersChange((prev) => ({
              ...prev,
              category: undefined,
            }))
          }
          className="px-2 py-2"
        >
          <Check
            className={`h-4 w-4 mr-2 ${
              !filters.category ? "opacity-100" : "opacity-0"
            }`}
          />
          <span className={!filters.category ? "font-medium" : ""}>
            All categories
          </span>
        </DropdownMenuItem>
        {availableCategories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() =>
              onFiltersChange((prev) => ({ ...prev, category }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.category === category ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className={filters.category === category ? "font-medium" : ""}>
              {category}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
