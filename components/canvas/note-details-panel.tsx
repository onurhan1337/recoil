"use client";

import { X, Star, Pin, Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import type { CanvasNote } from "@/lib/canvas/types";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "../markdown-renderer";
import { stripMarkdown } from "@/lib/utils";

interface NoteDetailsPanelProps {
  note: CanvasNote | null;
  onClose: () => void;
  connectedNotes?: Array<{
    id: string;
    label: string | null;
    category: string | null;
    linkType: string;
  }>;
}

export function NoteDetailsPanel({
  note,
  onClose,
  connectedNotes = [],
}: NoteDetailsPanelProps) {
  return (
    <AnimatePresence>
      {note && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 350,
            duration: 0.2,
          }}
          className="absolute top-4 right-4 bottom-4 w-[420px] z-20"
        >
          <div className="h-full rounded-2xl bg-background/95 backdrop-blur-xl border shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-linear-to-b from-muted/50 to-transparent">
              <h2 className="font-medium font-lora text-lg">
                Mind Node Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-auto hover:bg-background/60"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {note.title && (
                    <h3 className="font-medium font-lora text-xl line-clamp-1">
                      <MarkdownRenderer content={note.title} />
                    </h3>
                  )}
                  {note.label && (
                    <p className="text-sm text-muted-foreground font-lora">
                      <MarkdownRenderer content={note.label} />
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {note.pinned && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Pin className="h-3 w-3" />
                      <span className="font-medium font-lora">Pinned</span>
                    </Badge>
                  )}
                  {note.favorite && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 text-stone-500 fill-stone-500" />
                      <span className="font-medium font-lora">Favorite</span>
                    </Badge>
                  )}
                  {note.archived && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Archive className="h-3 w-3" />
                      <span className="font-medium font-lora">Archived</span>
                    </Badge>
                  )}
                  {note.category && (
                    <Badge variant="secondary">
                      <span className="font-medium font-lora">
                        {note.category}
                      </span>
                    </Badge>
                  )}
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Card className="border-muted/50">
                    <CardContent className="p-4">
                      <MarkdownRenderer
                        content={note.content}
                        compact
                        className="prose-p:text-[13px] font-lora"
                      />
                    </CardContent>
                  </Card>
                </div>

                {connectedNotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium font-lora">
                      Connected Notes ({connectedNotes.length})
                    </h4>
                    <div className="space-y-2">
                      {connectedNotes.map((connectedNote) => (
                        <Card key={connectedNote.id}>
                          <CardHeader className="p-3">
                            <CardTitle className="text-xs flex items-center justify-between">
                              <span className="truncate">
                                {stripMarkdown(
                                  connectedNote.label || "Untitled"
                                )}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] ml-2"
                              >
                                {connectedNote.linkType}
                              </Badge>
                            </CardTitle>
                            {connectedNote.category && (
                              <p className="text-[10px] text-muted-foreground">
                                {connectedNote.category}
                              </p>
                            )}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Metadata</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <span>
                      Created: {format(new Date(note.created_at), "PPp")}
                    </span>
                    <span>ID: {note.id}</span>
                  </div>
                </div>

                <Link href={`/notes?noteId=${note.id}`} target="_blank">
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Open in Notes
                  </Button>
                </Link>
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
