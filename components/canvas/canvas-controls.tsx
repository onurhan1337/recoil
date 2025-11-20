"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface CanvasControlsProps {
  reactFlowInstance: ReactFlowInstance | null;
  showSemanticLinks: boolean;
  onShowSemanticLinksChange: (show: boolean) => void;
  onSearchOpen: () => void;
  onGenerateSemanticLinks: () => void;
  isGenerating: boolean;
  onApplyLayout?: (layout: "grid" | "hierarchical" | "force") => void;
  onResetPositions?: () => void;
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

export function CanvasControls({
  reactFlowInstance,
  showSemanticLinks,
  onShowSemanticLinksChange,
  onSearchOpen,
  onGenerateSemanticLinks,
  isGenerating,
  onApplyLayout,
  onResetPositions,
}: CanvasControlsProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  };

  const handleResetConfirm = () => {
    if (onResetPositions) {
      onResetPositions();
      setShowResetDialog(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl px-3 py-2 border border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-8 w-8 hover:bg-muted/60"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom out (-)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-8 w-8 hover:bg-muted/60"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom in (+)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFitView}
                className="h-8 w-8 hover:bg-muted/60"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Fit to view (0)</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/50" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchOpen}
                className="h-8 w-8 hover:bg-muted/60"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Search (Ctrl/Cmd + F)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onGenerateSemanticLinks}
                disabled={isGenerating}
                className="h-8 w-8 hover:bg-muted/60"
              >
                <Sparkles className={isGenerating ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isGenerating ? "Generating connections..." : "Generate semantic connections"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShowSemanticLinksChange(!showSemanticLinks)}
                className="h-8 w-8 hover:bg-muted/60"
                data-active={showSemanticLinks}
              >
                <Network className={showSemanticLinks ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{showSemanticLinks ? "Hide semantic connections" : "Show semantic connections"}</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/50" />

          {onApplyLayout && (
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/60">
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Auto-layout</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent side="top" className="w-56 mb-2">
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
              </PopoverContent>
            </Popover>
          )}

          {onResetPositions && (
            <>
              <div className="w-px h-6 bg-border/50" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowResetDialog(true)}
                    className="h-8 w-8 hover:bg-muted/60"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Reset positions</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/60">
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Keyboard shortcuts</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent side="top" className="w-80 mb-2">
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
            </PopoverContent>
          </Popover>
        </div>
      </TooltipProvider>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all positions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all notes to their default grid positions. Any custom positions you've set will be lost. This action cannot be undone.
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
