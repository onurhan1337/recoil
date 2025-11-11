"use client";

import Link from "next/link";
import { MessageCircle, Heart, Loader2 } from "lucide-react";
import { useNotesInfinite, useUsage, useTags } from "@/lib/api/hooks";
import { useCollections } from "@/lib/api/hooks/use-collections";
import { useNotesFilter } from "@/lib/api/hooks/use-notes-filter";
import { useNotesAnalytics } from "@/lib/api/hooks/use-notes-analytics";
import { NotesFilters } from "@/components/notes-filters";
import { NotesAnalytics } from "@/components/notes-analytics";
import { NotesGrid } from "@/components/notes-grid";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isProPlan } from "@/lib/utils";

export default function NotesPage() {
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotesInfinite();

  const allNotes = infiniteData?.notes || [];
  const { data: usage } = useUsage();
  const { data: allTags = [] } = useTags();
  const { data: collections = [] } = useCollections();
  const isPro = isProPlan(usage?.plan);

  const {
    filters,
    search,
    setSearch,
    setFilters,
    filteredNotes: notes,
    availableCategories,
    hasActiveFilters,
    clearFilters,
  } = useNotesFilter(allNotes);

  const analytics = useNotesAnalytics(allNotes);

  const favoriteNotes = notes.filter((note) => note.favorite);
  const nonFavoriteNotes = notes.filter((note) => !note.favorite);
  const pinnedCount = allNotes.filter((note) => note.pinned).length;

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
          search={search}
          setSearch={setSearch}
          onFiltersChange={setFilters}
          availableCategories={availableCategories as string[]}
          availableTags={allTags}
          availableCollections={collections}
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
        <div className="space-y-6 pb-8">
          {favoriteNotes.length > 0 && (
            <Accordion
              type="single"
              collapsible
              defaultValue="favorites"
              className="w-full"
            >
              <AccordionItem value="favorites" className="border-none">
                <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary fill-primary" />
                    <span className="font-medium font-lora tracking-tight">
                      Favorites
                    </span>
                    <span className="text-xs text-muted-foreground font-normal font-lora tracking-tight">
                      ({favoriteNotes.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <NotesGrid
                      notes={favoriteNotes}
                      pinnedCount={pinnedCount}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {nonFavoriteNotes.length > 0 && (
            <div className={favoriteNotes.length > 0 ? "pt-2" : ""}>
              <NotesGrid notes={nonFavoriteNotes} pinnedCount={pinnedCount} />
            </div>
          )}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="link"
                size="lg"
                className="cursor-pointer font-lora"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
