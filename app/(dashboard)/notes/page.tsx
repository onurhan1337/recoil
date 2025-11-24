"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Heart,
  Loader2,
  FileUp,
  Trash2,
  FolderPlus,
  Network,
  Search,
  Filter,
} from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { useNotesInfinite, useTags, useBulkDeleteNotes } from "@/lib/api/hooks";
import { useCollections } from "@/lib/api/hooks/use-collections";
import { useNotesFilter } from "@/lib/api/hooks/use-notes-filter";
import {
  useNotesAnalytics,
  useNotesAnalyticsQuery,
} from "@/lib/api/hooks/use-notes-analytics";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryFilter } from "@/components/notes-filters/filters/category-filter";
import { TagFilter } from "@/components/notes-filters/filters/tag-filter";
import { CollectionFilter } from "@/components/notes-filters/filters/collection-filter";
import { DateFilter } from "@/components/notes-filters/filters/date-filter";
import { SortFilter } from "@/components/notes-filters/filters/sort-filter";
import { PinnedFilter } from "@/components/notes-filters/filters/pinned-filter";
import { ArchivedFilter } from "@/components/notes-filters/filters/archived-filter";
import { ClearFiltersButton } from "@/components/notes-filters/filters/clear-filters-button";
import { FilterBadge } from "@/components/notes-filters/filter-badge";
import { getActiveFilters } from "@/components/notes-filters/filter-utils";
import { getFilterDefaults } from "@/lib/filters/config";
import type { NotesFiltersFromParsers } from "@/lib/filters/config";
import { NotesAnalytics } from "@/components/notes-analytics";
import { NotesGrid } from "@/components/notes-grid";
import { NoteDetailsDialog } from "@/components/note-details-dialog";
import { GraphViewPanel } from "@/components/graph-view-panel";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isProPlan } from "@/lib/utils";
import { MarkdownImportDialog } from "@/components/markdown-import-dialog";
import { BulkCollectionDialog } from "@/components/bulk-collection-dialog";
import { toast } from "sonner";
import { useDashboard } from "@/lib/contexts/dashboard-context";

export default function NotesPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set()
  );
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false);
  const [noteIdParam, setNoteIdParam] = useQueryState(
    "noteId",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const bulkDelete = useBulkDeleteNotes();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotesInfinite();

  const allNotes = infiniteData?.notes || [];
  const { usage } = useDashboard();
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

  const { data: analyticsNotes = [] } = useNotesAnalyticsQuery();
  const analytics = useNotesAnalytics(analyticsNotes);

  const favoriteNotes = notes.filter((note) => note.favorite);
  const nonFavoriteNotes = notes.filter((note) => !note.favorite);
  const pinnedCount = allNotes.filter((note) => note.pinned).length;

  const selectedNoteFromUrl = useMemo(() => {
    if (!noteIdParam || isLoading) return null;
    return allNotes.find((note) => note.id === noteIdParam) || null;
  }, [noteIdParam, allNotes, isLoading]);

  useEffect(() => {
    if (noteIdParam && !isLoading && !selectedNoteFromUrl) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else if (!hasNextPage && allNotes.length > 0) {
        setNoteIdParam("");
        toast.error("Note not found or you don't have access to it");
      }
    }
  }, [
    noteIdParam,
    selectedNoteFromUrl,
    allNotes.length,
    isLoading,
    setNoteIdParam,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const handleNoteSelect = (noteId: string, selected: boolean) => {
    setSelectedNoteIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(noteId);
      } else {
        newSet.delete(noteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedNoteIds(new Set(notes.map((note) => note.id)));
  };

  const handleDeselectAll = () => {
    setSelectedNoteIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedNoteIds.size === 0) return;

    try {
      await bulkDelete.mutateAsync(Array.from(selectedNoteIds));
      toast.success(
        `Deleted ${selectedNoteIds.size} note${
          selectedNoteIds.size !== 1 ? "s" : ""
        }`
      );
      setSelectedNoteIds(new Set());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete notes"
      );
    }
  };

  const removeFilter = (key: keyof typeof filters) => {
    if (key === "search") {
      setSearch("");
      return;
    }

    const defaults = getFilterDefaults();
    setFilters((prev: NotesFiltersFromParsers) => ({
      ...prev,
      [key]: defaults[key as keyof typeof defaults],
    }));
  };

  const activeFilters = getActiveFilters(filters);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearch(e.currentTarget.value);
    }
  };

  return (
    <GraphViewPanel
      open={isGraphViewOpen}
      onOpenChange={setIsGraphViewOpen}
      notes={allNotes}
    >
      <div className="space-y-8">
        <MarkdownImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
        />

        <BulkCollectionDialog
          open={isCollectionDialogOpen}
          onOpenChange={setIsCollectionDialogOpen}
          selectedNoteIds={Array.from(selectedNoteIds)}
          onSuccess={() => setSelectedNoteIds(new Set())}
        />

        {selectedNoteFromUrl && (
          <NoteDetailsDialog
            note={selectedNoteFromUrl}
            pinnedCount={pinnedCount}
            trigger={null}
            open={Boolean(noteIdParam)}
            onOpenChange={(open) => {
              if (!open) {
                setNoteIdParam("");
              }
            }}
          />
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
              Notes
            </h1>
            <p className="text-muted-foreground tracking-wide font-lora text-sm">
              {allNotes.length} {allNotes.length === 1 ? "note" : "notes"} in
              your collection
              {notes.length !== allNotes.length && (
                <span className="ml-1">({notes.length} shown)</span>
              )}
            </p>
          </div>

          {selectedNoteIds.size > 0 && (
            <div className="rounded-md border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedNoteIds.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={selectedNoteIds.size === notes.length}
                      className="cursor-pointer"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleDeselectAll}
                      disabled={selectedNoteIds.size === 0}
                      className="cursor-pointer"
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCollectionDialogOpen(true)}
                    disabled={selectedNoteIds.size === 0}
                    className="flex items-center gap-2"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Collections
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={
                      selectedNoteIds.size === 0 || bulkDelete.isPending
                    }
                    className="flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedNoteIds.size})
                  </Button>
                </div>
              </div>
            </div>
          )}

          {allNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border bg-card shadow-sm p-2">
                <div className="relative flex-1 min-w-0 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-foreground/70" />
                  <Input
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 pr-3 h-9 text-sm border shadow-sm focus-visible:ring-1 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="h-6 w-px bg-border mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 h-9 px-2.5 rounded-md transition-all ${
                        hasActiveFilters
                          ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Filter
                        className={`h-3.5 w-3.5 shrink-0 ${
                          hasActiveFilters ? "text-primary" : ""
                        }`}
                      />
                      <span className="text-xs font-normal">Filters</span>
                      {hasActiveFilters && (
                        <Badge
                          variant="secondary"
                          className="ml-0.5 h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[10px] font-semibold bg-primary/20 text-primary border-0"
                        >
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Filter by
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />

                    <CategoryFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                      availableCategories={availableCategories as string[]}
                    />

                    <TagFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                      availableTags={allTags}
                    />

                    <CollectionFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                      availableCollections={collections}
                    />

                    <DateFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    <SortFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    <DropdownMenuSeparator className="my-1" />

                    <PinnedFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    <ArchivedFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    {hasActiveFilters && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <ClearFiltersButton onClearFilters={clearFilters} />
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-border mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGraphViewOpen(true)}
                  className="gap-1.5 h-9 px-2.5 rounded-md hover:bg-muted transition-colors"
                >
                  <Network className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-normal">Graph View</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImportDialogOpen(true)}
                  className="gap-1.5 h-9 px-2.5 rounded-md hover:bg-muted transition-colors"
                >
                  <FileUp className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-normal">Import</span>
                </Button>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <FilterBadge
                      key={filter.key}
                      label={filter.label}
                      onRemove={() => removeFilter(filter.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
                        selectedNoteIds={selectedNoteIds}
                        onNoteSelect={handleNoteSelect}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {nonFavoriteNotes.length > 0 && (
              <div className={favoriteNotes.length > 0 ? "pt-2" : ""}>
                <NotesGrid
                  notes={nonFavoriteNotes}
                  pinnedCount={pinnedCount}
                  selectedNoteIds={selectedNoteIds}
                  onNoteSelect={handleNoteSelect}
                />
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
    </GraphViewPanel>
  );
}
