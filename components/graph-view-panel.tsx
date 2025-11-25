"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { KnowledgeGraph } from "@/components/graph-view/graph-wrapper";
import {
  GraphControls,
  DEFAULT_SETTINGS,
  type GraphSettings,
} from "@/components/graph-view/graph-controls";
import { useCanvas } from "@/lib/api/hooks";
import { Loader2, Sparkles, X } from "lucide-react";
import type { Note } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { applyGraphFilters } from "@/lib/graph/utils";
import { ProFeatureLock } from "@/components/pro-feature-lock";

interface GraphViewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  children: React.ReactNode;
  isPro?: boolean;
}

export function GraphViewPanel({
  open,
  onOpenChange,
  children,
  isPro = false,
}: GraphViewPanelProps) {
  const [showSemanticLinks, setShowSemanticLinks] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [graphSettings, setGraphSettings] =
    useState<GraphSettings>(DEFAULT_SETTINGS);
  const router = useRouter();

  const { data, isLoading, error } = useCanvas({
    includeSemanticLinks: showSemanticLinks,
    enabled: open && isPro,
  });

  const filteredNotes = useMemo(() => {
    if (!data) return [];
    return applyGraphFilters(data.notes, data.links, graphSettings.filters);
  }, [data, graphSettings.filters]);

  const handleNodeClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    router.push(`/notes?noteId=${noteId}`);
  };

  const stats = data
    ? {
        nodes: data.notes.length,
        connections: data.links.length,
      }
    : { nodes: 0, connections: 0 };

  useEffect(() => {
    if (open) {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.overflow = "hidden";
      }
      document.body.style.overflow = "hidden";
    } else {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.overflow = "";
      }
      document.body.style.overflow = "";
    }

    return () => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.overflow = "";
      }
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-y-0 left-64 right-0 z-50 bg-background overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full overflow-hidden"
      >
        <ResizablePanel
          defaultSize={70}
          minSize={25}
          className="overflow-hidden"
        >
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-4xl min-h-full p-8 lg:p-12">
              {children}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-border hover:bg-border/80 transition-colors"
        />

        <ResizablePanel
          defaultSize={30}
          minSize={25}
          maxSize={75}
          className="overflow-hidden"
        >
          <div className="h-full flex flex-col bg-background border-l overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold font-lora">
                    Knowledge Graph
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Visualize connections between your notes
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                  aria-label="Close graph view"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="semantic-links"
                          checked={showSemanticLinks}
                          onCheckedChange={setShowSemanticLinks}
                        />
                        <Label
                          htmlFor="semantic-links"
                          className="text-sm font-medium cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          AI Links
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs">
                        Show AI-suggested connections between notes that are
                        related by topic or content, even if you haven't linked
                        them manually. Helps you discover hidden relationships
                        in your notes.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-background overflow-hidden relative">
              {!isPro ||
              (error &&
                error instanceof Error &&
                error.message.includes("Pro plan")) ? (
                <div className="flex items-center justify-center h-full p-8">
                  <ProFeatureLock
                    variant="card"
                    title="Graph View"
                    description="Visualize your notes as an interactive knowledge graph. See connections and relationships between your ideas."
                  />
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading graph...
                    </p>
                  </div>
                </div>
              ) : data && data.notes.length > 0 ? (
                <>
                  <KnowledgeGraph
                    notes={data.notes}
                    links={data.links}
                    onNodeClick={handleNodeClick}
                    selectedNoteId={selectedNoteId}
                    settings={graphSettings}
                    filteredNotes={filteredNotes}
                  />
                  <GraphControls
                    settings={graphSettings}
                    onSettingsChange={setGraphSettings}
                    stats={{
                      nodes: filteredNotes.length,
                      connections: data.links.length,
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      No notes to visualize
                    </p>
                    <Button onClick={() => router.push("/notes")}>
                      Create Notes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
