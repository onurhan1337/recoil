"use client";

import { Sparkles } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface InsightsDisplayProps {
  insights: string;
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  return (
    <div className="relative rounded-xl border border-primary/20 bg-linear-to-br from-primary/5 via-background to-primary/5 p-8 backdrop-blur-sm">
      <div className="absolute top-4 right-4">
        <Sparkles className="h-5 w-5 text-primary/40" />
      </div>
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            AI Insights
          </span>
        </div>
        <div className="font-medium text-foreground text-sm tracking-tight">
          <MarkdownRenderer content={insights} />
        </div>
      </div>
    </div>
  );
}
