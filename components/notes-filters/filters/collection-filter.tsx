import { Library, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";
import type { Collection } from "@/lib/api/types";

interface CollectionFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
  availableCollections: Collection[];
}

export function CollectionFilter({
  filters,
  onFiltersChange,
  availableCollections,
}: CollectionFilterProps) {
  const selectedCollection = availableCollections.find(
    (c) => c.id === filters.collection
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-2 py-2">
        <Library
          className={`h-4 w-4 ${filters.collection ? "text-primary" : ""}`}
        />
        <span className={filters.collection ? "font-medium" : ""}>
          Collection
        </span>
        {selectedCollection && (
          <Badge
            variant="secondary"
            className="ml-auto text-xs px-1.5 py-0 h-5"
          >
            {selectedCollection.name}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        <DropdownMenuItem
          onClick={() =>
            onFiltersChange((prev: NotesFiltersFromParsers) => ({
              ...prev,
              collection: null,
            }))
          }
          className="px-2 py-2"
        >
          <Check
            className={`h-4 w-4 mr-2 ${
              !filters.collection ? "opacity-100" : "opacity-0"
            }`}
          />
          <span className={!filters.collection ? "font-medium" : ""}>
            All collections
          </span>
        </DropdownMenuItem>
        {availableCollections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() =>
              onFiltersChange((prev: NotesFiltersFromParsers) => ({
                ...prev,
                collection: collection.id,
              }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.collection === collection.id ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={
                filters.collection === collection.id ? "font-medium" : ""
              }
            >
              {collection.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
