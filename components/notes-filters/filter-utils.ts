import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import { getActiveFilters as getActiveFiltersFromConfig } from "@/lib/filters/config";

export function getActiveFilters(filters: URLNotesFilters) {
  return getActiveFiltersFromConfig(filters);
}
