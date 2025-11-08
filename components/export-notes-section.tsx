"use client";

import { Download, FileJson, FileText, Sparkles, Loader2, Archive } from "lucide-react";
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
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Export & Backup</h2>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/20 p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                Backup Your Knowledge Base
                {hasNotes && (
                  <span className="text-xs font-normal text-muted-foreground">
                    • {notes.length} {notes.length === 1 ? "note" : "notes"} ready
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export your notes with complete metadata including content, labels, categories, tags, and timestamps.
                Keep your data safe and portable.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ExportCard
              icon={FileJson}
              title="JSON Format"
              description="Machine-readable structured data"
              badge="Developer Friendly"
              badgeVariant="blue"
              features={[
                "Complete metadata preservation",
                "Easy programmatic import",
                "Perfect for backups & migrations",
              ]}
              onClick={onExportJSON}
              disabled={!hasNotes || isExporting}
              isLoading={isExporting}
            />

            <ExportCard
              icon={FileText}
              title="Markdown Format"
              description="Human-readable formatted text"
              badge="Universal"
              badgeVariant="purple"
              features={[
                "Beautiful formatting preserved",
                "Compatible with any editor",
                "Great for sharing & archiving",
              ]}
              onClick={onExportMarkdown}
              disabled={!hasNotes || isExporting}
              isLoading={isExporting}
            />
          </div>

          {!hasNotes && (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
              <Sparkles className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Create your first note to enable exports
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExportCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  badgeVariant: "blue" | "purple";
  features: string[];
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

function ExportCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant,
  features,
  onClick,
  disabled,
  isLoading,
}: ExportCardProps) {
  const badgeColors = {
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 ring-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-lg bg-muted p-2.5 ring-1 ring-border group-hover:bg-primary/10 group-hover:ring-primary/20 transition-all">
            <Icon className="h-5 w-5 group-hover:text-primary transition-colors" />
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <ul className="space-y-1.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Exporting...</span>
          </div>
        </div>
      )}
    </button>
  );
}
