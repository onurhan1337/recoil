import { X } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ClearFiltersButtonProps {
  onClearFilters: () => void;
}

export function ClearFiltersButton({
  onClearFilters,
}: ClearFiltersButtonProps) {
  return (
    <DropdownMenuItem
      onClick={onClearFilters}
      className="px-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <X className="h-4 w-4 mr-2" />
      <span className="font-medium">Clear all filters</span>
    </DropdownMenuItem>
  );
}
