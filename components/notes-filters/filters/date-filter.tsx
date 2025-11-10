import { Calendar, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { URLNotesFilters } from "@/lib/api/hooks/use-notes-filter";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";
import { DATE_RANGE_OPTIONS } from "@/lib/filters/config";

interface DateFilterProps {
  filters: URLNotesFilters;
  onFiltersChange: (
    updates:
      | Partial<NotesFiltersFromParsers>
      | ((prev: NotesFiltersFromParsers) => Partial<NotesFiltersFromParsers>)
  ) => void;
}

const DATE_RANGE_LABELS: Record<(typeof DATE_RANGE_OPTIONS)[number], string> = {
  all: "All time",
  week: "This week",
  month: "This month",
};

const DATE_RANGE_ITEMS = DATE_RANGE_OPTIONS.map((value) => ({
  value,
  label: DATE_RANGE_LABELS[value],
}));

export function DateFilter({ filters, onFiltersChange }: DateFilterProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-2 py-2">
        <Calendar
          className={`h-4 w-4 ${
            filters.dateRange !== "all" ? "text-primary" : ""
          }`}
        />
        <span className={filters.dateRange !== "all" ? "font-medium" : ""}>
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
        {DATE_RANGE_ITEMS.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() =>
              onFiltersChange((prev: NotesFiltersFromParsers) => ({
                ...prev,
                dateRange: range.value,
              }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.dateRange === range.value ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={filters.dateRange === range.value ? "font-medium" : ""}
            >
              {range.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
