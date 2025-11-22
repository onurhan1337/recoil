"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { useQueryStates } from "nuqs";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Network,
  Search,
  Keyboard,
  Sparkles,
  LayoutGrid,
  RotateCcw,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ReactFlowInstance } from "@xyflow/react";
import {
  canvasFiltersParsers,
  hasActiveCanvasFilters,
  getCanvasFilterDefaults,
} from "@/lib/canvas/filters";
import type { LucideIcon } from "lucide-react";

interface CanvasControlsProps {
  reactFlowInstance: ReactFlowInstance | null;
  showSemanticLinks: boolean;
  onShowSemanticLinksChange: (show: boolean) => void;
  onSearchOpen: () => void;
  onGenerateSemanticLinks: () => void;
  isGenerating: boolean;
  onApplyLayout?: (layout: "grid" | "hierarchical" | "force") => void;
  onResetPositions?: () => void;
  availableCategories: string[];
  availableTags: string[];
}

const shortcuts = [
  { keys: "+ / =", description: "Zoom in" },
  { keys: "- / _", description: "Zoom out" },
  { keys: "0", description: "Fit to view" },
  { keys: "Arrow keys / WASD", description: "Pan canvas" },
  { keys: "Ctrl/Cmd + A", description: "Select all" },
  { keys: "Ctrl/Cmd + F", description: "Search" },
  { keys: "Escape", description: "Clear selection" },
];

type ControlItemType =
  | "button"
  | "toggle"
  | "popover"
  | "dropdown"
  | "separator"
  | "filter";

interface BaseControlItem {
  id: string;
  type: ControlItemType;
  tooltip?: string;
}

interface ButtonControlItem extends BaseControlItem {
  type: "button";
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
}

interface ToggleControlItem extends BaseControlItem {
  type: "toggle";
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  tooltip: string;
  activeTooltip?: string;
}

interface PopoverControlItem extends BaseControlItem {
  type: "popover";
  icon: LucideIcon;
  tooltip: string;
  content: ReactNode;
}

interface SeparatorControlItem extends BaseControlItem {
  type: "separator";
}

interface FilterControlItem extends BaseControlItem {
  type: "filter";
  availableCategories: string[];
  availableTags: string[];
}

type ControlItem =
  | ButtonControlItem
  | ToggleControlItem
  | PopoverControlItem
  | SeparatorControlItem
  | FilterControlItem;

function ControlButton({
  item,
  children,
}: {
  item: ButtonControlItem | ToggleControlItem;
  children: ReactNode;
}) {
  const tooltipText =
    item.type === "toggle" && item.active && item.activeTooltip
      ? item.activeTooltip
      : item.tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function FilterControl({ item }: { item: FilterControlItem }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useQueryStates(canvasFiltersParsers, {
    shallow: false,
    throttleMs: 100,
  });

  const hasActiveFilters = useMemo(
    () => hasActiveCanvasFilters({ ...filters, search: "" }),
    [filters]
  );

  const activeFilterCount = useMemo(
    () =>
      filters.categories.length +
      filters.tags.length +
      (filters.pinned ? 1 : 0) +
      (filters.archived ? 1 : 0),
    [filters]
  );

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category];
      void setFilters({ categories: newCategories });
    },
    [filters.categories, setFilters]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const newTags = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      void setFilters({ tags: newTags });
    },
    [filters.tags, setFilters]
  );

  const handleClearFilters = useCallback(() => {
    const defaults = getCanvasFilterDefaults();
    void setFilters({
      categories: defaults.categories,
      tags: defaults.tags,
      pinned: defaults.pinned,
      archived: defaults.archived,
    });
  }, [setFilters]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 hover:bg-muted/60 relative ${
                hasActiveFilters ? "text-primary" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[10px] font-semibold bg-primary/10 text-primary border-primary/20"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Filters</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filter by
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {item.availableCategories.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Categories
            </DropdownMenuLabel>
            {item.availableCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {item.availableTags.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Tags
            </DropdownMenuLabel>
            {item.availableTags.slice(0, 10).map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Status
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.pinned ?? false}
          onCheckedChange={(checked) =>
            void setFilters({ pinned: checked || null })
          }
        >
          Pinned only
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.archived ?? false}
          onCheckedChange={(checked) =>
            void setFilters({ archived: checked || null })
          }
        >
          Show archived
        </DropdownMenuCheckboxItem>

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleClearFilters}
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CanvasControls({
  reactFlowInstance,
  showSemanticLinks,
  onShowSemanticLinksChange,
  onSearchOpen,
  onGenerateSemanticLinks,
  isGenerating,
  onApplyLayout,
  onResetPositions,
  availableCategories,
  availableTags,
}: CanvasControlsProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  const handleResetConfirm = useCallback(() => {
    if (onResetPositions) {
      onResetPositions();
      setShowResetDialog(false);
    }
  }, [onResetPositions]);

  const controlItems: ControlItem[] = useMemo(() => {
    const items: ControlItem[] = [
      {
        id: "zoom-out",
        type: "button",
        icon: ZoomOut,
        onClick: handleZoomOut,
        tooltip: "Zoom out (-)",
      },
      {
        id: "zoom-in",
        type: "button",
        icon: ZoomIn,
        onClick: handleZoomIn,
        tooltip: "Zoom in (+)",
      },
      {
        id: "fit-view",
        type: "button",
        icon: Maximize2,
        onClick: handleFitView,
        tooltip: "Fit to view (0)",
      },
      { id: "separator-1", type: "separator" },
      {
        id: "search",
        type: "button",
        icon: Search,
        onClick: onSearchOpen,
        tooltip: "Search (Ctrl/Cmd + F)",
      },
      {
        id: "generate-links",
        type: "button",
        icon: Sparkles,
        onClick: onGenerateSemanticLinks,
        disabled: isGenerating,
        tooltip: isGenerating
          ? "Generating connections..."
          : "Generate semantic connections",
      },
      {
        id: "toggle-semantic-links",
        type: "toggle",
        icon: Network,
        active: showSemanticLinks,
        onClick: () => onShowSemanticLinksChange(!showSemanticLinks),
        tooltip: "Show semantic connections",
        activeTooltip: "Hide semantic connections",
      },
      { id: "separator-2", type: "separator" },
      {
        id: "filter",
        type: "filter",
        availableCategories,
        availableTags,
      },
    ];

    if (onApplyLayout) {
      items.push({
        id: "layout",
        type: "popover",
        icon: LayoutGrid,
        tooltip: "Auto-layout",
        content: (
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-3">Layout Algorithm</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onApplyLayout("grid")}
            >
              Grid Layout
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onApplyLayout("hierarchical")}
            >
              Hierarchical Layout
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onApplyLayout("force")}
            >
              Force-Directed Layout
            </Button>
          </div>
        ),
      });
    }

    if (onResetPositions) {
      items.push(
        { id: "separator-3", type: "separator" },
        {
          id: "reset-positions",
          type: "button",
          icon: RotateCcw,
          onClick: () => setShowResetDialog(true),
          tooltip: "Reset positions",
        }
      );
    }

    items.push({
      id: "shortcuts",
      type: "popover",
      icon: Keyboard,
      tooltip: "Keyboard shortcuts",
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 rounded bg-muted font-mono text-[10px]">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ),
    });

    return items;
  }, [
    handleZoomIn,
    handleZoomOut,
    handleFitView,
    showSemanticLinks,
    onShowSemanticLinksChange,
    onSearchOpen,
    onGenerateSemanticLinks,
    isGenerating,
    onApplyLayout,
    onResetPositions,
    availableCategories,
    availableTags,
  ]);

  const renderControl = (item: ControlItem) => {
    switch (item.type) {
      case "separator":
        return <div key={item.id} className="w-px h-6 bg-border/50" />;

      case "button": {
        const Icon = item.icon;
        const iconClassName =
          item.id === "generate-links" && isGenerating
            ? "h-4 w-4 animate-pulse"
            : "h-4 w-4";

        return (
          <ControlButton key={item.id} item={item}>
            <Button
              variant="ghost"
              size="icon"
              onClick={item.onClick}
              disabled={item.disabled}
              className="h-8 w-8 hover:bg-muted/60"
            >
              <Icon className={iconClassName} />
            </Button>
          </ControlButton>
        );
      }

      case "toggle": {
        const Icon = item.icon;
        return (
          <ControlButton key={item.id} item={item}>
            <Button
              variant="ghost"
              size="icon"
              onClick={item.onClick}
              className="h-8 w-8 hover:bg-muted/60"
              data-active={item.active}
            >
              <Icon
                className={item.active ? "h-4 w-4 text-primary" : "h-4 w-4"}
              />
            </Button>
          </ControlButton>
        );
      }

      case "popover":
        return (
          <Popover key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted/60"
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent
              side="top"
              className={item.id === "shortcuts" ? "w-80 mb-2" : "w-56 mb-2"}
            >
              {item.content}
            </PopoverContent>
          </Popover>
        );

      case "filter":
        return <FilterControl key={item.id} item={item} />;

      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl px-3 py-2 border border-border/50">
          {controlItems.map(renderControl)}
        </div>
      </TooltipProvider>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all positions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all notes to their default grid positions. Any
              custom positions you've set will be lost. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm}>
              Reset positions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
