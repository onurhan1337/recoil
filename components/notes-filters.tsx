"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface NotesFiltersProps {
  filters: NotesFilters;
  onFiltersChange: (filters: NotesFilters | ((prev: NotesFilters) => NotesFilters)) => void;
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
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
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

        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({
              ...prev,
              category: value === "all" ? undefined : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.tag || "all"}
          onValueChange={(value) =>
            onFiltersChange((prev) => ({
              ...prev,
              tag: value === "all" ? undefined : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value: "week" | "month" | "all") =>
            onFiltersChange((prev) => ({ ...prev, dateRange: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value: "newest" | "oldest" | "category") =>
            onFiltersChange((prev) => ({ ...prev, sortBy: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="category">By category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
