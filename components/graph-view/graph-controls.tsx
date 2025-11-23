"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  Settings,
  Search,
  Filter,
  Eye,
  Zap,
  RotateCcw,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { GraphSettings, GraphControlsProps } from "@/lib/graph/types";
import { DEFAULT_SETTINGS, SETTING_DESCRIPTIONS } from "@/lib/graph/config";

const createSettingsUpdater =
  <T extends keyof GraphSettings>(
    section: T,
    currentSettings: GraphSettings,
    onSettingsChange: (settings: GraphSettings) => void
  ) =>
  (updates: Partial<GraphSettings[T]>) => {
    onSettingsChange({
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        ...updates,
      },
    });
  };

type ControlItemType = "button" | "toggle" | "popover" | "separator";

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

type ControlItem =
  | ButtonControlItem
  | ToggleControlItem
  | PopoverControlItem
  | SeparatorControlItem;

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

interface SliderSettingProps {
  id: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
}

function SliderSetting({
  id,
  label,
  description,
  value,
  min,
  max,
  step,
  formatValue = (v) => v.toFixed(2),
  onChange,
}: SliderSettingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <Label htmlFor={id} className="text-xs font-medium">
            {label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-xs text-muted-foreground font-mono min-w-12 text-right">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values: number[]) => onChange(values[0])}
      />
    </div>
  );
}

export function GraphControls({
  settings,
  onSettingsChange,
  stats,
}: GraphControlsProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [forcesOpen, setForcesOpen] = useState(false);

  const updateFilters = createSettingsUpdater(
    "filters",
    settings,
    onSettingsChange
  );
  const updateDisplay = createSettingsUpdater(
    "display",
    settings,
    onSettingsChange
  );
  const updateForces = createSettingsUpdater(
    "forces",
    settings,
    onSettingsChange
  );

  const resetToDefaults = useCallback(() => {
    onSettingsChange({
      ...DEFAULT_SETTINGS,
      filters: { ...DEFAULT_SETTINGS.filters },
      display: { ...DEFAULT_SETTINGS.display },
      forces: { ...DEFAULT_SETTINGS.forces },
    });
  }, [onSettingsChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      settings.filters.searchQuery !== "" ||
      !settings.filters.showTags ||
      !settings.filters.showAttachments ||
      !settings.filters.existingFilesOnly ||
      !settings.filters.showOrphans
    );
  }, [settings.filters]);

  const controlItems: ControlItem[] = useMemo(() => {
    const items: ControlItem[] = [
      {
        id: "search",
        type: "popover",
        icon: Search,
        tooltip: "Search notes",
        content: (
          <div className="space-y-3 w-64">
            <div>
              <Label
                htmlFor="graph-search"
                className="text-xs font-medium flex items-center gap-2 mb-2"
              >
                <Search className="h-3 w-3" />
                {SETTING_DESCRIPTIONS.searchQuery.label}
              </Label>
              <Input
                id="graph-search"
                placeholder="Search notes..."
                value={settings.filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="h-8 text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {SETTING_DESCRIPTIONS.searchQuery.description}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "filter",
        type: "popover",
        icon: Filter,
        tooltip: "Filters",
        content: (
          <div className="space-y-4 w-64">
            <h4 className="font-medium text-sm">What to Show</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-tags"
                  className="text-xs font-medium cursor-pointer"
                >
                  {SETTING_DESCRIPTIONS.showTags.label}
                </Label>
                <Switch
                  id="show-tags"
                  checked={settings.filters.showTags}
                  onCheckedChange={(checked) =>
                    updateFilters({ showTags: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-attachments"
                  className="text-xs font-medium cursor-pointer"
                >
                  {SETTING_DESCRIPTIONS.showAttachments.label}
                </Label>
                <Switch
                  id="show-attachments"
                  checked={settings.filters.showAttachments}
                  onCheckedChange={(checked) =>
                    updateFilters({ showAttachments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="existing-files"
                  className="text-xs font-medium cursor-pointer"
                >
                  {SETTING_DESCRIPTIONS.existingFilesOnly.label}
                </Label>
                <Switch
                  id="existing-files"
                  checked={settings.filters.existingFilesOnly}
                  onCheckedChange={(checked) =>
                    updateFilters({ existingFilesOnly: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-orphans"
                  className="text-xs font-medium cursor-pointer"
                >
                  {SETTING_DESCRIPTIONS.showOrphans.label}
                </Label>
                <Switch
                  id="show-orphans"
                  checked={settings.filters.showOrphans}
                  onCheckedChange={(checked) =>
                    updateFilters({ showOrphans: checked })
                  }
                />
              </div>
            </div>
          </div>
        ),
      },
      { id: "separator-1", type: "separator" },
      {
        id: "display",
        type: "popover",
        icon: Eye,
        tooltip: "Appearance",
        content: (
          <div className="space-y-4 w-64">
            <h4 className="font-medium text-sm">Appearance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-arrows"
                  className="text-xs font-medium cursor-pointer"
                >
                  {SETTING_DESCRIPTIONS.showArrows.label}
                </Label>
                <Switch
                  id="show-arrows"
                  checked={settings.display.showArrows}
                  onCheckedChange={(checked) =>
                    updateDisplay({ showArrows: checked })
                  }
                />
              </div>
              <SliderSetting
                id="text-fade"
                label={SETTING_DESCRIPTIONS.textFadeThreshold.label}
                description={SETTING_DESCRIPTIONS.textFadeThreshold.description}
                value={settings.display.textFadeThreshold}
                min={0}
                max={1}
                step={0.1}
                formatValue={(v) => v.toFixed(1)}
                onChange={(value) =>
                  updateDisplay({ textFadeThreshold: value })
                }
              />
              <SliderSetting
                id="node-size"
                label={SETTING_DESCRIPTIONS.nodeSize.label}
                description={SETTING_DESCRIPTIONS.nodeSize.description}
                value={settings.display.nodeSize}
                min={2}
                max={20}
                step={1}
                formatValue={(v) => v.toString()}
                onChange={(value) => updateDisplay({ nodeSize: value })}
              />
              <SliderSetting
                id="link-thickness"
                label={SETTING_DESCRIPTIONS.linkThickness.label}
                description={SETTING_DESCRIPTIONS.linkThickness.description}
                value={settings.display.linkThickness}
                min={0.5}
                max={5}
                step={0.5}
                formatValue={(v) => v.toFixed(1)}
                onChange={(value) => updateDisplay({ linkThickness: value })}
              />
            </div>
          </div>
        ),
      },
      {
        id: "forces",
        type: "popover",
        icon: Zap,
        tooltip: "Layout & Spacing",
        content: (
          <div className="space-y-4 w-64">
            <h4 className="font-medium text-sm">Layout & Spacing</h4>
            <div className="space-y-4">
              <SliderSetting
                id="center-force"
                label={SETTING_DESCRIPTIONS.centerForce.label}
                description={SETTING_DESCRIPTIONS.centerForce.description}
                value={settings.forces.centerForce}
                min={0}
                max={1}
                step={0.05}
                formatValue={(v) => v.toFixed(2)}
                onChange={(value) => updateForces({ centerForce: value })}
              />
              <SliderSetting
                id="repel-force"
                label={SETTING_DESCRIPTIONS.repelForce.label}
                description={SETTING_DESCRIPTIONS.repelForce.description}
                value={settings.forces.repelForce}
                min={0}
                max={500}
                step={10}
                formatValue={(v) => v.toString()}
                onChange={(value) => updateForces({ repelForce: value })}
              />
              <SliderSetting
                id="link-force"
                label={SETTING_DESCRIPTIONS.linkForce.label}
                description={SETTING_DESCRIPTIONS.linkForce.description}
                value={settings.forces.linkForce}
                min={0}
                max={2}
                step={0.1}
                formatValue={(v) => v.toFixed(2)}
                onChange={(value) => updateForces({ linkForce: value })}
              />
              <SliderSetting
                id="link-distance"
                label={SETTING_DESCRIPTIONS.linkDistance.label}
                description={SETTING_DESCRIPTIONS.linkDistance.description}
                value={settings.forces.linkDistance}
                min={10}
                max={200}
                step={5}
                formatValue={(v) => v.toString()}
                onChange={(value) => updateForces({ linkDistance: value })}
              />
            </div>
          </div>
        ),
      },
      { id: "separator-2", type: "separator" },
      {
        id: "reset",
        type: "button",
        icon: RotateCcw,
        onClick: resetToDefaults,
        tooltip: "Reset to defaults",
      },
    ];

    return items;
  }, [settings, updateFilters, updateDisplay, updateForces, resetToDefaults]);

  const renderControl = (item: ControlItem) => {
    switch (item.type) {
      case "separator":
        return <div key={item.id} className="w-px h-6 bg-border/50" />;

      case "button": {
        const Icon = item.icon;
        return (
          <ControlButton key={item.id} item={item}>
            <Button
              variant="ghost"
              size="icon"
              onClick={item.onClick}
              disabled={item.disabled}
              className="h-8 w-8 hover:bg-muted/60"
            >
              <Icon className="h-4 w-4" />
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

      case "popover": {
        const isOpen =
          item.id === "search"
            ? searchOpen
            : item.id === "filter"
            ? filtersOpen
            : item.id === "display"
            ? displayOpen
            : item.id === "forces"
            ? forcesOpen
            : false;
        const setOpen =
          item.id === "search"
            ? setSearchOpen
            : item.id === "filter"
            ? setFiltersOpen
            : item.id === "display"
            ? setDisplayOpen
            : item.id === "forces"
            ? setForcesOpen
            : () => {};

        return (
          <Popover key={item.id} open={isOpen} onOpenChange={setOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 hover:bg-muted/60 relative ${
                      item.id === "filter" && hasActiveFilters
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.id === "filter" && hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[10px] font-semibold bg-primary/10 text-primary border-primary/20"
                      >
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent side="top" className="w-auto mb-2">
              {item.content}
            </PopoverContent>
          </Popover>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl px-3 py-2 border border-border/50">
          <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <span className="font-mono">{stats.nodes}</span>
            <span>nodes</span>
            <span className="mx-1">•</span>
            <span className="font-mono">{stats.connections}</span>
            <span>links</span>
          </div>
          <div className="w-px h-6 bg-border/50" />
          {controlItems.map(renderControl)}
        </div>
      </TooltipProvider>
    </div>
  );
}

export { DEFAULT_SETTINGS } from "@/lib/graph/config";
export type { GraphSettings } from "@/lib/graph/types";
