import { useMemo, useCallback } from "react";
import { useQueryState, useQueryStates, debounce } from "nuqs";
import {
  searchParser,
  notesFiltersParsers,
  applyFilters,
  hasActiveFilters as checkHasActiveFilters,
  getFilterDefaults,
  type NotesFiltersFromParsers,
} from "@/lib/filters/config";
import type { Note } from "../types";

const SEARCH_DEBOUNCE_DELAY = 200;

export function useNotesFilter(allNotes: Note[]) {
  const [search, setSearch] = useQueryState("search", {
    ...searchParser,
    shallow: false,
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_DELAY),
  });

  const [filters, setFilters] = useQueryStates(notesFiltersParsers, {
    shallow: false,
    throttleMs: 100,
  });

  const allFilters = useMemo(
    () => ({ search: search ?? "", ...filters }),
    [search, filters]
  );

  const filteredNotes = useMemo(
    () => applyFilters(allNotes, allFilters),
    [allNotes, allFilters]
  );

  const availableCategories = useMemo(() => {
    const categories = new Set(
      allNotes.map((note) => note.category).filter(Boolean)
    );
    return Array.from(categories).sort();
  }, [allNotes]);

  const hasActiveFilters = useMemo(
    () => checkHasActiveFilters(allFilters),
    [allFilters]
  );

  const defaults = useMemo(() => getFilterDefaults(), []);
  const clearFilters = useCallback(() => {
    setSearch(defaults.search);
    setFilters({
      category: defaults.category,
      tag: defaults.tag,
      dateRange: defaults.dateRange,
      sortBy: defaults.sortBy,
      pinned: defaults.pinned,
    });
  }, [setSearch, setFilters, defaults]);

  return {
    filters: allFilters,
    search: search ?? "",
    setSearch,
    setFilters,
    filteredNotes,
    availableCategories,
    hasActiveFilters,
    clearFilters,
  };
}

export type URLNotesFilters = NotesFiltersFromParsers & { search: string };
