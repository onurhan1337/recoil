"use client";

import { useState, useMemo, useCallback } from "react";
import { useQueryStates } from "nuqs";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { canvasFiltersParsers, hasActiveCanvasFilters, getCanvasFilterDefaults } from "@/lib/canvas/filters";

interface CanvasFiltersProps {
  availableCategories: string[];
  availableTags: string[];
}

export function CanvasFilters({
  availableCategories,
  availableTags,
}: CanvasFiltersProps) {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useQueryStates(canvasFiltersParsers, {
    shallow: false,
    throttleMs: 100,
  });

  const hasActiveFilters = useMemo(
    () => hasActiveCanvasFilters({ ...filters, search: "" }),
    [filters]
  );

  const activeFilterCount = useMemo(
    () =>
      filters.categories.length +
      filters.tags.length +
      (filters.pinned ? 1 : 0) +
      (filters.archived ? 1 : 0),
    [filters]
  );

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category];
      void setFilters({ categories: newCategories });
    },
    [filters.categories, setFilters]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const newTags = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      void setFilters({ tags: newTags });
    },
    [filters.tags, setFilters]
  );

  const handleClearFilters = useCallback(() => {
    const defaults = getCanvasFilterDefaults();
    void setFilters({
      categories: defaults.categories,
      tags: defaults.tags,
      pinned: defaults.pinned,
      archived: defaults.archived,
    });
  }, [setFilters]);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
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
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filter by
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />

          {availableCategories.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Categories
              </DropdownMenuLabel>
              {availableCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {availableTags.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Tags
              </DropdownMenuLabel>
              {availableTags.slice(0, 10).map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Status
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.pinned ?? false}
            onCheckedChange={(checked) => void setFilters({ pinned: checked || null })}
          >
            Pinned only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.archived ?? false}
            onCheckedChange={(checked) => void setFilters({ archived: checked || null })}
          >
            Show archived
          </DropdownMenuCheckboxItem>

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleClearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
