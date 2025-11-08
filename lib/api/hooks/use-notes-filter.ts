import { useMemo, useState, useCallback } from "react";
import type { Note } from "../types";
import type { NotesFilters } from "./use-notes";

export function useNotesFilter(allNotes: Note[]) {
  const [filters, setFilters] = useState<NotesFilters>({
    search: "",
    category: undefined,
    tag: undefined,
    dateRange: "all",
    sortBy: "newest",
  });

  const filteredNotes = useMemo(() => {
    let result = [...allNotes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (note) =>
          note.content.toLowerCase().includes(searchLower) ||
          note.label?.toLowerCase().includes(searchLower) ||
          note.category?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      result = result.filter((note) => note.category === filters.category);
    }

    if (filters.tag) {
      result = result.filter((note) => note.tags?.includes(filters.tag as string));
    }

    if (filters.dateRange !== "all") {
      const cutoffDate = new Date();
      if (filters.dateRange === "week") {
        cutoffDate.setDate(cutoffDate.getDate() - 7);
      } else if (filters.dateRange === "month") {
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      }
      result = result.filter((note) => new Date(note.created_at) >= cutoffDate);
    }

    if (filters.sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters.sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filters.sortBy === "category") {
      result.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
    }

    return result;
  }, [allNotes, filters]);

  const availableCategories = useMemo(() => {
    const categories = new Set(allNotes.map((note) => note.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [allNotes]);

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.tag ||
    filters.dateRange !== "all" ||
    filters.sortBy !== "newest";

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      category: undefined,
      tag: undefined,
      dateRange: "all",
      sortBy: "newest",
    });
  }, []);

  return {
    filters,
    setFilters,
    filteredNotes,
    availableCategories,
    hasActiveFilters,
    clearFilters,
  };
}
