"use client";

import { TrendingUp, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProFeatureLock } from "@/components/pro-feature-lock";
import { TopCategory } from "@/lib/utils/top-categories";

interface NotesAnalyticsProps {
  analytics: {
    total: number;
    thisWeek: number;
    topCategories: Array<TopCategory>;
  } | null;
  isPro: boolean;
}

export function NotesAnalytics({ analytics, isPro }: NotesAnalyticsProps) {
  if (!isPro) {
    return (
      <div className="relative rounded-md border-2 border-dashed bg-muted/20 p-6">
        <ProFeatureLock
          variant="inline"
          description="Upgrade to Pro to unlock notes analytics and insights."
          className="min-h-[200px]"
        />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="relative rounded-md border-2 border-dashed bg-muted/20 p-6">
      <div className="rounded-md border bg-card p-5 relative overflow-hidden">
        <div className="space-y-5 relative z-10">
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Total Notes
              </p>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-2xl font-bold">{analytics.total}</p>
              </div>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Notes This Week
              </p>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-2xl font-bold">{analytics.thisWeek}</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-5">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Top Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {analytics.topCategories.map(({ category, count }) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id="shapeGrad1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="hsl(var(--muted-foreground))"
                  stopOpacity="0.12"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--muted-foreground))"
                  stopOpacity="0.04"
                />
              </linearGradient>
              <linearGradient
                id="shapeGrad2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="hsl(var(--muted-foreground))"
                  stopOpacity="0.1"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--muted-foreground))"
                  stopOpacity="0.03"
                />
              </linearGradient>
            </defs>

            <rect
              x="120"
              y="120"
              width="60"
              height="60"
              rx="8"
              fill="url(#shapeGrad1)"
              transform="rotate(15 150 150)"
            />
            <rect
              x="100"
              y="140"
              width="50"
              height="50"
              rx="6"
              fill="url(#shapeGrad2)"
              transform="rotate(-10 125 165)"
            />

            <line
              x1="80"
              y1="160"
              x2="180"
              y2="80"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.1"
            />
            <line
              x1="90"
              y1="170"
              x2="170"
              y2="90"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.08"
            />

            <circle
              cx="140"
              cy="130"
              r="5"
              fill="hsl(var(--muted-foreground))"
              opacity="0.12"
            />
            <circle
              cx="160"
              cy="150"
              r="4"
              fill="hsl(var(--muted-foreground))"
              opacity="0.1"
            />
            <circle
              cx="130"
              cy="160"
              r="4.5"
              fill="hsl(var(--muted-foreground))"
              opacity="0.09"
            />

            <path
              d="M 150 100 L 165 108 L 165 123 L 150 131 L 135 123 L 135 108 Z"
              fill="hsl(var(--muted-foreground))"
              opacity="0.08"
            />

            <path
              d="M 110 110 L 130 110 L 120 125 Z"
              fill="hsl(var(--muted-foreground))"
              opacity="0.1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
