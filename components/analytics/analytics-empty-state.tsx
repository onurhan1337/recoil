"use client";

import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsEmptyStateProps {
  onAnalyze: () => void;
}

export function AnalyticsEmptyState({ onAnalyze }: AnalyticsEmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed bg-muted/30 p-16 text-center">
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4 border-2 border-dashed">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold">No analysis yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Analyze" to discover insights about your thinking patterns
            from your recent notes
          </p>
        </div>
        <Button onClick={onAnalyze} className="mt-4" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Start Analysis
        </Button>
      </div>
    </div>
  );
}
