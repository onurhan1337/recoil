"use client";

import Link from "next/link";
import { MessageCircle, Lock, TrendingUp, FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";
import { NoteDetailsDialog } from "@/components/note-details-dialog";
import { useNotes, useUsage } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { useMemo } from "react";

export default function NotesPage() {
  const { data: notes = [], isLoading } = useNotes();
  const { data: usage } = useUsage();
  const isPro = usage?.plan === "pro";

  const analytics = useMemo(() => {
    if (!notes.length) return null;

    const categoryCount = notes.reduce((acc, note) => {
      const cat = note.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const thisWeek = notes.filter((note) => {
      const noteDate = new Date(note.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    }).length;

    return {
      total: notes.length,
      thisWeek,
      topCategories,
    };
  }, [notes]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
          Notes
        </h1>
        <p className="text-muted-foreground tracking-wide font-lora text-sm">
          {notes.length} {notes.length === 1 ? "note" : "notes"} in your
          collection
        </p>
      </div>

      {analytics && (
        <div className="relative rounded-lg border-2 border-dashed bg-muted/20 p-6">
          {!isPro && (
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  transparent,
                  transparent 15px,
                  rgba(0, 0, 0, 0.03) 15px,
                  rgba(0, 0, 0, 0.03) 17px
                )`,
              }}
            >
              <div className="text-center space-y-2">
                <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
                <UpgradePlanDialog
                  trigger={
                    <button className="text-xs font-medium hover:underline underline-offset-4">
                      Upgrade to unlock
                    </button>
                  }
                />
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total}</p>
                  <p className="text-xs text-muted-foreground">Total Notes</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{analytics.thisWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 sm:col-span-2">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">
                    Top Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topCategories.map(([category, count]) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-xs"
                      >
                        {category} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-md border bg-muted/50 p-4 text-sm">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Looking for something specific?
              <br /> Use{" "}
              <Link
                href="/"
                className="font-medium text-foreground hover:underline underline-offset-4"
              >
                AI chat
              </Link>{" "}
              to search through your notes with natural language and get
              intelligent answers.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No notes yet. Click "New Note" to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteDetailsDialog
              key={note.id}
              note={note}
              trigger={
                <button className="group relative flex flex-col overflow-hidden rounded-md border bg-card p-4 transition-all hover:bg-muted/50 text-left w-full">
                  <div className="flex-1 flex flex-col gap-3">
                    {note.label && (
                      <h3 className="text-sm font-medium line-clamp-1">
                        {note.label}
                      </h3>
                    )}
                    <div className="text-sm line-clamp-6 leading-relaxed font-lora">
                      <MarkdownRenderer content={note.content} />
                    </div>
                    <div className="mt-auto pt-2 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {note.category && (
                          <Badge variant="secondary" className="text-xs">
                            {note.category}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatShortDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
