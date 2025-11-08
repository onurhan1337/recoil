"use client";

import { Lock, TrendingUp, FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";

interface NotesAnalyticsProps {
  analytics: {
    total: number;
    thisWeek: number;
    topCategories: [string, number][];
  } | null;
  isPro: boolean;
}

export function NotesAnalytics({ analytics, isPro }: NotesAnalyticsProps) {
  if (!analytics) return null;

  return (
    <div className="relative rounded-lg border-2 border-dashed bg-muted/20 p-6">
      {!isPro && (
        <div
          className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              135deg,
              transparent,
              transparent 15px,
              rgba(0, 0, 0, 0.03) 15px,
              rgba(0, 0, 0, 0.03) 17px
            )`,
          }}
        >
          <div className="text-center space-y-2">
            <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
            <UpgradePlanDialog
              trigger={
                <button className="text-xs font-medium hover:underline underline-offset-4">
                  Upgrade to unlock
                </button>
              }
            />
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{analytics.total}</p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{analytics.thisWeek}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:col-span-2">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">Top Categories</p>
              <div className="flex flex-wrap gap-2">
                {analytics.topCategories.map(([category, count]) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
