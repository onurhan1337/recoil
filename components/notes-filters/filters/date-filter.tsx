import { Calendar, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { NotesFilters } from "@/lib/api/hooks/use-notes";

interface DateFilterProps {
  filters: NotesFilters;
  onFiltersChange: (filters: (prev: NotesFilters) => NotesFilters) => void;
}

const DATE_RANGES = [
  { value: "all" as const, label: "All time" },
  { value: "week" as const, label: "This week" },
  { value: "month" as const, label: "This month" },
];

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
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 h-5">
            {filters.dateRange === "week" ? "Week" : "Month"}
          </Badge>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1">
        {DATE_RANGES.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() =>
              onFiltersChange((prev) => ({ ...prev, dateRange: range.value }))
            }
            className="px-2 py-2"
          >
            <Check
              className={`h-4 w-4 mr-2 ${
                filters.dateRange === range.value ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={
                filters.dateRange === range.value ? "font-medium" : ""
              }
            >
              {range.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
