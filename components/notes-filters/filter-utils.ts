import type { NotesFilters } from "@/lib/api/hooks/use-notes";

export function getActiveFilterLabel(
  key: string,
  value: string | boolean | undefined
): string | null {
  if (value === undefined || value === "all" || value === false) return null;

  switch (key) {
    case "category":
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
}

export function getActiveFilters(filters: NotesFilters) {
  return [
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
}
