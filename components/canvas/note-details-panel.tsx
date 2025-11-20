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
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 bottom-4 w-[420px] z-20"
        >
          <div className="h-full rounded-2xl bg-background/95 backdrop-blur-xl border shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-linear-to-b from-muted/50 to-transparent">
              <h2 className="font-semibold text-lg">Mind Node Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-background/60"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  {note.title && (
                    <h3 className="font-semibold text-xl">{note.title}</h3>
                  )}
                  {note.label && (
                    <p className="text-sm text-muted-foreground">
                      {note.label}
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
                      Pinned
                    </Badge>
                  )}
                  {note.favorite && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      Favorite
                    </Badge>
                  )}
                  {note.archived && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Archive className="h-3 w-3" />
                      Archived
                    </Badge>
                  )}
                  {note.category && (
                    <Badge variant="outline">{note.category}</Badge>
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
                  <h4 className="text-sm font-medium">Content</h4>
                  <Card className="border-muted/50">
                    <CardContent className="p-4">
                      <div className="prose prose-sm prose-stone dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="text-sm leading-relaxed">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                                {children}
                              </pre>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-semibold mt-4 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-semibold mt-3 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mt-3 mb-1">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1">
                                {children}
                              </ol>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {note.content}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {connectedNotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Connected Notes ({connectedNotes.length})
                    </h4>
                    <div className="space-y-2">
                      {connectedNotes.map((connectedNote) => (
                        <Card key={connectedNote.id}>
                          <CardHeader className="p-3">
                            <CardTitle className="text-xs flex items-center justify-between">
                              <span className="truncate">
                                {connectedNote.label || "Untitled"}
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
                    <p>Created: {format(new Date(note.created_at), "PPp")}</p>
                    <p>ID: {note.id}</p>
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
