import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
  parseAsBoolean,
  type inferParserType,
} from "nuqs/server";
import { subWeeks, subMonths, isAfter } from "date-fns";
import type { Note } from "@/lib/api/types";

export const DATE_RANGE_OPTIONS = ["week", "month", "all"] as const;
export const SORT_OPTIONS = ["newest", "oldest", "category"] as const;

type DateRange = (typeof DATE_RANGE_OPTIONS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

type FilterValues = {
  search: string;
  category: string | null;
  tag: string | null;
  dateRange: DateRange;
  sortBy: SortOption;
  pinned: boolean | null;
};

const filterBySearch = (notes: Note[], value: string): Note[] => {
  if (!value) return notes;
  const searchLower = value.toLowerCase();
  return notes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchLower) ||
      note.label?.toLowerCase().includes(searchLower) ||
      note.category?.toLowerCase().includes(searchLower)
  );
};

const filterByCategory = (notes: Note[], value: string | null): Note[] => {
  if (!value) return notes;
  return notes.filter((note) => note.category === value);
};

const filterByTag = (notes: Note[], value: string | null): Note[] => {
  if (!value) return notes;
  return notes.filter((note) => note.tags?.includes(value));
};

const filterByPinned = (notes: Note[], value: boolean | null): Note[] => {
  if (value === null) return notes;
  return notes.filter((note) => note.pinned === value);
};

const filterByDateRange = (notes: Note[], value: DateRange): Note[] => {
  if (value === "all") return notes;
  const now = new Date();
  const cutoffDate = value === "week" ? subWeeks(now, 1) : subMonths(now, 1);
  return notes.filter((note) => isAfter(new Date(note.created_at), cutoffDate));
};

const sortNotes = (notes: Note[], value: SortOption): Note[] => {
  const sorted = [...notes];
  sorted.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (value === "oldest") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (value === "category") {
      return (a.category || "").localeCompare(b.category || "");
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return sorted;
};

export const FILTER_CONFIG = {
  search: {
    parser: parseAsString.withDefault(""),
    filter: filterBySearch,
    isActive: (value: string) => !!value,
    getLabel: (value: string) => value,
    defaultValue: "" as const,
  },
  category: {
    parser: parseAsString,
    filter: filterByCategory,
    isActive: (value: string | null) => !!value,
    getLabel: (value: string | null) => value || null,
    defaultValue: null,
  },
  tag: {
    parser: parseAsString,
    filter: filterByTag,
    isActive: (value: string | null) => !!value,
    getLabel: (value: string | null) => value || null,
    defaultValue: null,
  },
  dateRange: {
    parser: parseAsStringEnum([...DATE_RANGE_OPTIONS]).withDefault("all"),
    filter: filterByDateRange,
    isActive: (value: DateRange) => value !== "all",
    getLabel: (value: DateRange) =>
      value === "week" ? "This week" : value === "month" ? "This month" : null,
    defaultValue: "all" as const,
  },
  sortBy: {
    parser: parseAsStringEnum([...SORT_OPTIONS]).withDefault("newest"),
    filter: sortNotes,
    isActive: (value: SortOption) => value !== "newest",
    getLabel: (value: SortOption) =>
      value === "oldest"
        ? "Oldest first"
        : value === "category"
        ? "By category"
        : null,
    defaultValue: "newest" as const,
  },
  pinned: {
    parser: parseAsBoolean,
    filter: filterByPinned,
    isActive: (value: boolean | null) => value !== null && value === true,
    getLabel: (value: boolean | null) => (value === true ? "Pinned" : null),
    defaultValue: null,
  },
} as const;

export const notesFiltersParsers = {
  category: FILTER_CONFIG.category.parser,
  tag: FILTER_CONFIG.tag.parser,
  dateRange: FILTER_CONFIG.dateRange.parser,
  sortBy: FILTER_CONFIG.sortBy.parser,
  pinned: FILTER_CONFIG.pinned.parser,
} as const;

export const searchParser = FILTER_CONFIG.search.parser;

export const allNotesFiltersParsers = {
  search: searchParser,
  ...notesFiltersParsers,
} as const;

export const notesFiltersCache = createSearchParamsCache(
  allNotesFiltersParsers
);

export type NotesFiltersFromParsers = inferParserType<
  typeof notesFiltersParsers
>;
export type AllNotesFiltersFromParsers = inferParserType<
  typeof allNotesFiltersParsers
>;

export const applyFilters = (notes: Note[], filters: FilterValues): Note[] => {
  let result = notes;
  result = FILTER_CONFIG.search.filter(result, filters.search);
  result = FILTER_CONFIG.category.filter(result, filters.category);
  result = FILTER_CONFIG.tag.filter(result, filters.tag);
  result = FILTER_CONFIG.pinned.filter(result, filters.pinned);
  result = FILTER_CONFIG.dateRange.filter(result, filters.dateRange);
  result = FILTER_CONFIG.sortBy.filter(result, filters.sortBy);
  return result;
};

export const hasActiveFilters = (filters: FilterValues): boolean => {
  return (
    FILTER_CONFIG.search.isActive(filters.search) ||
    FILTER_CONFIG.category.isActive(filters.category) ||
    FILTER_CONFIG.tag.isActive(filters.tag) ||
    FILTER_CONFIG.dateRange.isActive(filters.dateRange) ||
    FILTER_CONFIG.sortBy.isActive(filters.sortBy) ||
    FILTER_CONFIG.pinned.isActive(filters.pinned)
  );
};

export const getActiveFilters = (
  filters: FilterValues
): Array<{ key: keyof FilterValues; label: string }> => {
  const results: Array<{ key: keyof FilterValues; label: string }> = [];

  const searchLabel = FILTER_CONFIG.search.getLabel(filters.search);
  if (searchLabel) results.push({ key: "search", label: searchLabel });

  const categoryLabel = FILTER_CONFIG.category.getLabel(filters.category);
  if (categoryLabel) results.push({ key: "category", label: categoryLabel });

  const tagLabel = FILTER_CONFIG.tag.getLabel(filters.tag);
  if (tagLabel) results.push({ key: "tag", label: tagLabel });

  const dateRangeLabel = FILTER_CONFIG.dateRange.getLabel(filters.dateRange);
  if (dateRangeLabel) results.push({ key: "dateRange", label: dateRangeLabel });

  const sortByLabel = FILTER_CONFIG.sortBy.getLabel(filters.sortBy);
  if (sortByLabel) results.push({ key: "sortBy", label: sortByLabel });

  const pinnedLabel = FILTER_CONFIG.pinned.getLabel(filters.pinned);
  if (pinnedLabel) results.push({ key: "pinned", label: pinnedLabel });

  return results;
};

export const getFilterDefaults = (): FilterValues => {
  return {
    search: FILTER_CONFIG.search.defaultValue,
    category: FILTER_CONFIG.category.defaultValue,
    tag: FILTER_CONFIG.tag.defaultValue,
    dateRange: FILTER_CONFIG.dateRange.defaultValue,
    sortBy: FILTER_CONFIG.sortBy.defaultValue,
    pinned: FILTER_CONFIG.pinned.defaultValue,
  };
};
