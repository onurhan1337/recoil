"use client";

import { useState } from "react";
import {
  Link2,
  Plus,
  X,
  Loader2,
  Search,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryState, parseAsString, debounce } from "nuqs";
import { useNoteLinks } from "@/lib/api/hooks";
import { useNotes } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import { MarkdownRenderer } from "../markdown-renderer";
import { toast } from "sonner";

interface NoteManualLinksProps {
  noteId: string;
  onLinkClick: (linkedNoteId: string) => void;
}

export function NoteManualLinks({ noteId, onLinkClick }: NoteManualLinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [searchQuery, setSearchQuery] = useQueryState("linkSearch", {
    ...parseAsString.withDefault(""),
    shallow: false,
    limitUrlUpdates: debounce(300),
  });

  const {
    data: links,
    isLoading,
    createLink,
    deleteLink,
  } = useNoteLinks(isExpanded ? noteId : null);
  const { data: notes } = useNotes();

  const manualLinks = links?.filter((link) => link.linkType === "manual") || [];

  const linkedNoteIds = new Set(manualLinks.map((link) => link.note.id));
  const availableNotes = notes?.filter(
    (note) =>
      note.id !== noteId &&
      !linkedNoteIds.has(note.id) &&
      (!searchQuery ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.label?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateLink = async (targetNoteId: string) => {
    try {
      await createLink(targetNoteId);
      toast.success("Link created successfully");
      setSearchQuery("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create link"
      );
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      toast.success("Link removed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove link"
      );
    }
  };

  if (!isExpanded) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>Linked Notes</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setIsExpanded(true)}
          >
            <Link2 className="h-3 w-3 mr-1" />
            Manage Links
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link2 className="h-4 w-4" />
          <span>Linked Notes</span>
          {manualLinks.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {manualLinks.length}
            </Badge>
          )}
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Link
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search notes to link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {!availableNotes || availableNotes.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {searchQuery
                    ? "No matching notes found"
                    : "No notes available to link"}
                </div>
              ) : (
                <div className="p-1">
                  {availableNotes.slice(0, 10).map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleCreateLink(note.id)}
                      className="w-full text-left p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs line-clamp-2 mb-1">
                            {note.title || note.label || note.content}
                          </p>
                          <div className="flex items-center gap-2">
                            {note.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4"
                              >
                                {note.category}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatShortDate(note.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading links...</span>
          </div>
        </div>
      ) : manualLinks.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No links yet. Connect related notes together.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {manualLinks.map((link) => (
            <div
              key={link.linkId}
              className="group relative rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => onLinkClick(link.note.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {link.direction === "outgoing" ? (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ArrowLeft className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs line-clamp-3 mb-2">
                      <MarkdownRenderer content={link.note.content} />
                    </div>
                    <div className="flex items-center gap-2">
                      {link.note.category && (
                        <Badge variant="outline" className="text-[10px] h-5">
                          {link.note.category}
                        </Badge>
                      )}
                      {link.note.label && (
                        <span className="text-[10px] text-muted-foreground">
                          {link.note.label}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatShortDate(link.note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLink(link.linkId);
                }}
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
