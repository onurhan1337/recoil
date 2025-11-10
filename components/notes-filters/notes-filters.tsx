"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterBadge } from "./filter-badge";
import { CategoryFilter } from "./filters/category-filter";
import { TagFilter } from "./filters/tag-filter";
import { DateFilter } from "./filters/date-filter";
import { SortFilter } from "./filters/sort-filter";
import { PinnedFilter } from "./filters/pinned-filter";
import { ClearFiltersButton } from "./filters/clear-filters-button";
import { getActiveFilters } from "./filter-utils";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface NotesFiltersProps {
  filters: NotesFilters;
  onFiltersChange: (
    filters: NotesFilters | ((prev: NotesFilters) => NotesFilters)
  ) => void;
  availableCategories: string[];
  availableTags: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function NotesFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  hasActiveFilters,
  onClearFilters,
}: NotesFiltersProps) {
  const removeFilter = (key: keyof NotesFilters) => {
    onFiltersChange((prev) => {
      if (key === "search") {
        return { ...prev, search: "" };
      } else if (key === "category" || key === "tag") {
        return { ...prev, [key]: undefined };
      } else if (key === "dateRange") {
        return { ...prev, dateRange: "all" };
      } else if (key === "sortBy") {
        return { ...prev, sortBy: "newest" };
      } else if (key === "pinned") {
        return { ...prev, pinned: undefined };
      }
      return prev;
    });
  };

  const activeFilters = getActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`gap-2 h-9 px-4 transition-all ${
                hasActiveFilters
                  ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
            >
              <Filter
                className={`h-4 w-4 ${hasActiveFilters ? "text-primary" : ""}`}
              />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                >
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Filter by
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />

            <CategoryFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
              availableCategories={availableCategories}
            />

            <TagFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
              availableTags={availableTags}
            />

            <DateFilter filters={filters} onFiltersChange={onFiltersChange} />

            <SortFilter filters={filters} onFiltersChange={onFiltersChange} />

            <DropdownMenuSeparator className="my-1" />

            <PinnedFilter filters={filters} onFiltersChange={onFiltersChange} />

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <ClearFiltersButton onClearFilters={onClearFilters} />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <FilterBadge
              key={filter.key}
              label={filter.label}
              onRemove={() => removeFilter(filter.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
