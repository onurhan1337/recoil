"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KnowledgeGraph } from "@/components/graph-view/graph-wrapper";
import {
  GraphControls,
  DEFAULT_SETTINGS,
  type GraphSettings,
} from "@/components/graph-view/graph-controls";
import { useCanvas } from "@/lib/api/hooks";
import { Loader2, Sparkles } from "lucide-react";
import type { Note } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { applyGraphFilters } from "@/lib/graph/utils";

interface GraphViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
}

export function GraphViewSheet({
  open,
  onOpenChange,
  notes,
}: GraphViewSheetProps) {
  const [showSemanticLinks, setShowSemanticLinks] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [graphSettings, setGraphSettings] =
    useState<GraphSettings>(DEFAULT_SETTINGS);
  const router = useRouter();

  const { data, isLoading } = useCanvas({
    includeSemanticLinks: showSemanticLinks,
    enabled: open,
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
        nodes: filteredNotes.length,
        connections: data.links.length,
      }
    : { nodes: 0, connections: 0 };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-full p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="font-medium font-lora">
                  Knowledge Graph
                </SheetTitle>
                <SheetDescription>
                  Visualize connections between your notes
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3">
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
                  AI Connections
                </Label>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 min-h-0 bg-background">
            {isLoading ? (
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
                  stats={stats}
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
      </SheetContent>
    </Sheet>
  );
}
