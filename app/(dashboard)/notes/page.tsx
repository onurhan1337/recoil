"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useNotes, useUsage, useTags } from "@/lib/api/hooks";
import { useNotesFilter } from "@/lib/api/hooks/use-notes-filter";
import { useNotesAnalytics } from "@/lib/api/hooks/use-notes-analytics";
import { NotesFilters } from "@/components/notes-filters";
import { NotesAnalytics } from "@/components/notes-analytics";
import { NotesGrid } from "@/components/notes-grid";
import { isProPlan } from "@/lib/utils";

export default function NotesPage() {
  const { data: allNotes = [], isLoading } = useNotes();
  const { data: usage } = useUsage();
  const { data: allTags = [] } = useTags();
  const isPro = isProPlan(usage?.plan);

  const {
    filters,
    setFilters,
    filteredNotes: notes,
    availableCategories,
    hasActiveFilters,
    clearFilters,
  } = useNotesFilter(allNotes);

  const analytics = useNotesAnalytics(allNotes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
          Notes
        </h1>
        <p className="text-muted-foreground tracking-wide font-lora text-sm">
          {allNotes.length} {allNotes.length === 1 ? "note" : "notes"} in your
          collection
          {notes.length !== allNotes.length && (
            <span className="ml-1">({notes.length} shown)</span>
          )}
        </p>
      </div>

      {allNotes.length > 0 && (
        <NotesFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCategories={availableCategories as string[]}
          availableTags={allTags}
          hasActiveFilters={!!hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      <NotesAnalytics analytics={analytics} isPro={isPro} />

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
        <NotesGrid notes={notes} />
      )}
    </div>
  );
}
