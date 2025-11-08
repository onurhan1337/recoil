"use client";

import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Note } from "@/lib/api/types";

interface ExportNotesSectionProps {
  notes: Note[];
  isExporting: boolean;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
}

export function ExportNotesSection({
  notes,
  isExporting,
  onExportJSON,
  onExportMarkdown,
}: ExportNotesSectionProps) {
  const hasNotes = notes.length > 0;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Export & Backup</h2>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Export your notes with complete metadata including content, labels,
            categories, tags, and timestamps.
          </p>
          {hasNotes && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{notes.length}</span>{" "}
              {notes.length === 1 ? "note" : "notes"} ready to export
            </p>
          )}
        </div>

        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted p-2">
                <FileJson className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">JSON Format</p>
                <p className="text-xs text-muted-foreground">
                  Machine-readable structured data
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportJSON}
              disabled={!hasNotes || isExporting}
              className="cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted p-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Markdown Format</p>
                <p className="text-xs text-muted-foreground">
                  Human-readable formatted text
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportMarkdown}
              disabled={!hasNotes || isExporting}
              className="cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </>
              )}
            </Button>
          </div>

          {!hasNotes && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Create your first note to enable exports
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
