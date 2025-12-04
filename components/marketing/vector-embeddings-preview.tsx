"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VectorEmbeddingsPreview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Animate typing effect
    const query = "machine learning";
    let index = 0;
    const interval = setInterval(() => {
      if (index < query.length) {
        setSearchQuery(query.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowResults(true), 300);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const results = [
    {
      id: "1",
      content: "Introduction to machine learning algorithms and neural networks",
      category: "work",
      similarity: 0.94,
    },
    {
      id: "2",
      content: "Deep learning concepts and practical applications",
      category: "research",
      similarity: 0.89,
    },
    {
      id: "3",
      content: "Notes on AI and data science fundamentals",
      category: "work",
      similarity: 0.86,
    },
  ];

  return (
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Vector Embeddings</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          all-MiniLM-L6-v2 generates 384-dimensional embeddings for semantic search
        </p>
      </div>
      
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <div className="w-full h-10 bg-background border border-border rounded-md pl-10 pr-3 flex items-center shadow-sm">
            {searchQuery ? (
              <span className="text-sm text-foreground font-medium">{searchQuery}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Search your notes...</span>
            )}
            {searchQuery && (
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="space-y-2.5 animate-fade-in">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="w-full text-left rounded-lg border bg-card/80 hover:bg-card p-3.5 transition-all hover:border-border/80 hover:shadow-sm group animate-fade-in"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs text-foreground/90 line-clamp-2 flex-1 min-w-0 leading-relaxed">
                    {result.content}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0 animate-scale-in">
                    {Math.round(result.similarity * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5 border-border/50">
                    {result.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Info - Subtle */}
        {showResults && (
          <div className="pt-4 border-t border-border/50 animate-fade-in" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Model:</span>
                <span className="font-medium text-foreground/80">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dimensions:</span>
                <span className="font-medium text-foreground/80">384</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Similarity:</span>
                <span className="font-medium text-foreground/80">Cosine</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
