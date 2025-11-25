"use client";

import { useState, useMemo } from "react";
import { useQueryStates } from "nuqs";
import { CanvasView } from "@/components/canvas/canvas-view";
import { useCanvas, useGenerateSemanticLinks } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProFeatureLock } from "@/components/pro-feature-lock";
import { toast } from "sonner";
import { canvasFiltersParsers, applyCanvasFilters } from "@/lib/canvas/filters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function CanvasPage() {
  const [showSemanticLinks, setShowSemanticLinks] = useState(false);

  const [filters] = useQueryStates(canvasFiltersParsers, {
    shallow: false,
    throttleMs: 100,
  });

  const { data, isLoading, error } = useCanvas({
    includeSemanticLinks: showSemanticLinks,
  });
  const generateSemanticLinks = useGenerateSemanticLinks();

  const filteredData = useMemo(() => {
    if (!data) return null;

    const filteredNotes = applyCanvasFilters(data.notes, {
      ...filters,
    });

    const filteredNoteIds = new Set(filteredNotes.map((n) => n.id));
    const filteredLinks = data.links.filter(
      (link) =>
        filteredNoteIds.has(link.source_note_id) &&
        filteredNoteIds.has(link.target_note_id)
    );

    return {
      notes: filteredNotes,
      links: filteredLinks,
    };
  }, [data, filters]);

  const availableCategories = useMemo(() => {
    if (!data) return [];
    return Array.from(
      new Set(data.notes.map((n) => n.category).filter((c): c is string => !!c))
    );
  }, [data]);

  const availableTags = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.notes.flatMap((n) => n.tags || [])));
  }, [data]);

  const handleGenerateSemanticLinks = () => {
    generateSemanticLinks.mutate(undefined, {
      onSuccess: (response) => {
        toast.success(response.message);
        if (response.linksCreated > 0) {
          setShowSemanticLinks(true);
        }
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate connections"
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load canvas";
    const isProRequired = errorMessage.includes("Pro plan");

    if (isProRequired) {
      return (
        <ProFeatureLock
          variant="detailed"
          title="Unlock Mind Map"
          description="Visualize your knowledge as an interactive mind map. See connections, patterns, and insights emerge from your notes."
          features={[
            {
              text: "Infinite canvas to spatially organize your thoughts",
            },
            {
              text: "Visual connections revealing relationships between ideas",
            },
            {
              text: "Intuitive drag-and-drop with keyboard shortcuts",
            },
            {
              text: "Semantic links powered by AI understanding",
            },
          ]}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data || !filteredData) {
    return null;
  }

  if (data.notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="max-w-md border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Your Mind Map Awaits</CardTitle>
            <CardDescription className="text-base">
              Start creating notes to see them visualized as an interconnected
              mind map. Watch your knowledge graph come to life.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/notes">
              <Button className="w-full" size="lg">
                Create Your First Note
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <CanvasView
        data={filteredData}
        showSemanticLinks={showSemanticLinks}
        onShowSemanticLinksChange={setShowSemanticLinks}
        onGenerateSemanticLinks={handleGenerateSemanticLinks}
        isGenerating={generateSemanticLinks.isPending}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />
    </div>
  );
}
