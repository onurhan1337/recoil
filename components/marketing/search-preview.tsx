"use client";

import { Search } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";

export function SearchPreview() {
  const results = [
    {
      id: "1",
      content: "Project ideas and brainstorming session from last week",
      category: "work",
      similarity: 0.92,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      content: "Meeting notes from the team standup",
      category: "work",
      similarity: 0.87,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      content: "Research findings on AI and machine learning",
      category: "research",
      similarity: 0.84,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Semantic Search</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Find notes by meaning, not just keywords. Powered by vector embeddings.
        </p>
      </div>
      
      <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-hide">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <div className="w-full h-10 bg-background border border-border rounded-md pl-10 pr-3 flex items-center shadow-sm">
            <span className="text-sm text-muted-foreground">Search your notes...</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {results.map((connection) => (
            <button
              key={connection.id}
              className="w-full text-left rounded-lg border bg-card/80 hover:bg-card p-3.5 transition-all hover:border-border/80 hover:shadow-sm group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs text-foreground/90 line-clamp-2 flex-1 min-w-0 leading-relaxed">
                  {connection.content}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                  {Math.round(connection.similarity * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                {connection.category && (
                  <Badge variant="outline" className="text-[10px] h-5 border-border/50">
                    {connection.category}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

