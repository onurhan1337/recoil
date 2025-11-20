import {
  parseAsString,
  parseAsBoolean,
  parseAsArrayOf,
  type inferParserType,
} from "nuqs/server";
import type { CanvasNote } from "./types";

type CanvasFilterValues = {
  search: string;
  categories: string[];
  tags: string[];
  pinned: boolean | null;
  archived: boolean | null;
};

const filterBySearch = (notes: CanvasNote[], value: string): CanvasNote[] => {
  if (!value) return notes;
  const searchLower = value.toLowerCase();
  return notes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchLower) ||
      note.title?.toLowerCase().includes(searchLower) ||
      note.label?.toLowerCase().includes(searchLower) ||
      note.category?.toLowerCase().includes(searchLower) ||
      note.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
  );
};

const filterByCategories = (notes: CanvasNote[], value: string[]): CanvasNote[] => {
  if (value.length === 0) return notes;
  return notes.filter((note) => note.category && value.includes(note.category));
};

const filterByTags = (notes: CanvasNote[], value: string[]): CanvasNote[] => {
  if (value.length === 0) return notes;
  return notes.filter((note) =>
    note.tags?.some((tag) => value.includes(tag))
  );
};

const filterByPinned = (notes: CanvasNote[], value: boolean | null): CanvasNote[] => {
  if (value === null) return notes;
  return notes.filter((note) => note.pinned === value);
};

const filterByArchived = (notes: CanvasNote[], value: boolean | null): CanvasNote[] => {
  if (value === null) return notes.filter((note) => !note.archived);
  return notes.filter((note) => note.archived === value);
};

export const CANVAS_FILTER_CONFIG = {
  search: {
    parser: parseAsString.withDefault(""),
    filter: filterBySearch,
    isActive: (value: string) => !!value,
    defaultValue: "" as const,
  },
  categories: {
    parser: parseAsArrayOf(parseAsString).withDefault([]),
    filter: filterByCategories,
    isActive: (value: string[]) => value.length > 0,
    defaultValue: [] as string[],
  },
  tags: {
    parser: parseAsArrayOf(parseAsString).withDefault([]),
    filter: filterByTags,
    isActive: (value: string[]) => value.length > 0,
    defaultValue: [] as string[],
  },
  pinned: {
    parser: parseAsBoolean,
    filter: filterByPinned,
    isActive: (value: boolean | null) => value !== null && value === true,
    defaultValue: null,
  },
  archived: {
    parser: parseAsBoolean,
    filter: filterByArchived,
    isActive: (value: boolean | null) => value !== null && value === true,
    defaultValue: null,
  },
} as const;

export const canvasFiltersParsers = {
  search: CANVAS_FILTER_CONFIG.search.parser,
  categories: CANVAS_FILTER_CONFIG.categories.parser,
  tags: CANVAS_FILTER_CONFIG.tags.parser,
  pinned: CANVAS_FILTER_CONFIG.pinned.parser,
  archived: CANVAS_FILTER_CONFIG.archived.parser,
} as const;

export type CanvasFiltersFromParsers = inferParserType<typeof canvasFiltersParsers>;

export const applyCanvasFilters = (
  notes: CanvasNote[],
  filters: CanvasFilterValues
): CanvasNote[] => {
  let result = notes;
  result = CANVAS_FILTER_CONFIG.search.filter(result, filters.search);
  result = CANVAS_FILTER_CONFIG.categories.filter(result, filters.categories);
  result = CANVAS_FILTER_CONFIG.tags.filter(result, filters.tags);
  result = CANVAS_FILTER_CONFIG.pinned.filter(result, filters.pinned);
  result = CANVAS_FILTER_CONFIG.archived.filter(result, filters.archived);
  return result;
};

export const hasActiveCanvasFilters = (filters: CanvasFilterValues): boolean => {
  return (
    CANVAS_FILTER_CONFIG.search.isActive(filters.search) ||
    CANVAS_FILTER_CONFIG.categories.isActive(filters.categories) ||
    CANVAS_FILTER_CONFIG.tags.isActive(filters.tags) ||
    CANVAS_FILTER_CONFIG.pinned.isActive(filters.pinned) ||
    CANVAS_FILTER_CONFIG.archived.isActive(filters.archived)
  );
};

export const getCanvasFilterDefaults = (): CanvasFilterValues => {
  return {
    search: CANVAS_FILTER_CONFIG.search.defaultValue,
    categories: CANVAS_FILTER_CONFIG.categories.defaultValue,
    tags: CANVAS_FILTER_CONFIG.tags.defaultValue,
    pinned: CANVAS_FILTER_CONFIG.pinned.defaultValue,
    archived: CANVAS_FILTER_CONFIG.archived.defaultValue,
  };
};
