"use client";

import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HistoryEmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4 border-2 border-dashed">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-lora">
              No Analysis History
            </h3>
            <p className="text-sm text-muted-foreground font-lora">
              Create your first analysis to discover insights about your thinking
              patterns and note-taking habits.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

