"use client";

import { Search } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";

export function DummySearchResults() {
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
    <div className="w-full h-full p-4 flex flex-col gap-3 overflow-hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <div className="w-full h-9 bg-background/50 border border-border/50 rounded-md pl-9 pr-3 flex items-center">
          <span className="text-xs text-muted-foreground/50">Search your notes...</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {results.map((connection) => (
          <button
            key={connection.id}
            className="w-full text-left rounded-lg border bg-muted/30 p-2.5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="text-[10px] text-muted-foreground line-clamp-1 flex-1 min-w-0">
                <MarkdownRenderer content={connection.content} compact />
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                {Math.round(connection.similarity * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {connection.category && (
                <Badge variant="outline" className="text-[10px] h-5">
                  {connection.category}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

