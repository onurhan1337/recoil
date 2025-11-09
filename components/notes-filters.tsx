"use client";

import {
  Search,
  X,
  Filter,
  Tag,
  Calendar,
  ArrowUpDown,
  Folder,
  Check,
  Pin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const getActiveFilterLabel = (
    key: string,
    value: string | boolean | undefined
  ) => {
    if (value === undefined || value === "all" || value === false) return null;

    switch (key) {
      case "category":
        return value as string;
      case "tag":
        return value as string;
      case "dateRange":
        return value === "week" ? "This week" : "This month";
      case "sortBy":
        return value === "oldest" ? "Oldest first" : "By category";
      case "pinned":
        return "Pinned";
      default:
        return null;
    }
  };

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

  const activeFilters = [
    filters.search && { key: "search" as const, label: filters.search },
    filters.category && {
      key: "category" as const,
      label: getActiveFilterLabel("category", filters.category),
    },
    filters.tag && {
      key: "tag" as const,
      label: getActiveFilterLabel("tag", filters.tag),
    },
    filters.dateRange !== "all" && {
      key: "dateRange" as const,
      label: getActiveFilterLabel("dateRange", filters.dateRange),
    },
    filters.sortBy !== "newest" && {
      key: "sortBy" as const,
      label: getActiveFilterLabel("sortBy", filters.sortBy),
    },
    filters.pinned !== undefined &&
      filters.pinned && {
        key: "pinned" as const,
        label: getActiveFilterLabel("pinned", filters.pinned),
      },
  ].filter(Boolean) as Array<{ key: keyof NotesFilters; label: string }>;

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

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="px-2 py-2">
                <Folder
                  className={`h-4 w-4 ${
                    filters.category ? "text-primary" : ""
                  }`}
                />
                <span className={filters.category ? "font-medium" : ""}>
                  Category
                </span>
                {filters.category && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
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
                        filters.category === category
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span
                      className={
                        filters.category === category ? "font-medium" : ""
                      }
                    >
                      {category}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="px-2 py-2">
                <Tag
                  className={`h-4 w-4 ${filters.tag ? "text-primary" : ""}`}
                />
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
                    onFiltersChange((prev) => ({ ...prev, tag: undefined }))
                  }
                  className="px-2 py-2"
                >
                  <Check
                    className={`h-4 w-4 mr-2 ${
                      !filters.tag ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className={!filters.tag ? "font-medium" : ""}>
                    All tags
                  </span>
                </DropdownMenuItem>
                {availableTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, tag }))
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

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="px-2 py-2">
                <Calendar
                  className={`h-4 w-4 ${
                    filters.dateRange !== "all" ? "text-primary" : ""
                  }`}
                />
                <span
                  className={filters.dateRange !== "all" ? "font-medium" : ""}
                >
                  Date
                </span>
                {filters.dateRange !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
                    {filters.dateRange === "week" ? "Week" : "Month"}
                  </Badge>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-1">
                {(["all", "week", "month"] as const).map((range) => (
                  <DropdownMenuItem
                    key={range}
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, dateRange: range }))
                    }
                    className="px-2 py-2"
                  >
                    <Check
                      className={`h-4 w-4 mr-2 ${
                        filters.dateRange === range
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span
                      className={
                        filters.dateRange === range ? "font-medium" : ""
                      }
                    >
                      {range === "all"
                        ? "All time"
                        : range === "week"
                        ? "This week"
                        : "This month"}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="px-2 py-2">
                <ArrowUpDown
                  className={`h-4 w-4 ${
                    filters.sortBy !== "newest" ? "text-primary" : ""
                  }`}
                />
                <span
                  className={filters.sortBy !== "newest" ? "font-medium" : ""}
                >
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
                {(["newest", "oldest", "category"] as const).map((sort) => (
                  <DropdownMenuItem
                    key={sort}
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, sortBy: sort }))
                    }
                    className="px-2 py-2"
                  >
                    <Check
                      className={`h-4 w-4 mr-2 ${
                        filters.sortBy === sort ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      className={filters.sortBy === sort ? "font-medium" : ""}
                    >
                      {sort === "newest"
                        ? "Newest first"
                        : sort === "oldest"
                        ? "Oldest first"
                        : "By category"}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="my-1" />

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

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={onClearFilters}
                  className="px-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span className="font-medium">Clear all filters</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
              {filter.label}
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
