"use client";

import { FileText, Activity, Zap, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardsProps {
  totalNotes: number;
  growthRate: number;
  avgNotesPerDay: number;
  mostActiveDay: string;
  categoryCount: number;
  timeRange: "7d" | "30d" | "90d";
}

export function MetricsCards({
  totalNotes,
  growthRate,
  avgNotesPerDay,
  mostActiveDay,
  categoryCount,
  timeRange,
}: MetricsCardsProps) {
  const timeRangeLabel =
    timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90";

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                <FileText className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Notes
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {totalNotes}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {growthRate >= 0 ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
                      {Math.abs(growthRate).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-500">
                      {Math.abs(growthRate).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  vs previous
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Avg per Day
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {avgNotesPerDay}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Last {timeRangeLabel} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Most Active
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {mostActiveDay}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Day of week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                <Target className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Categories
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {categoryCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Unique categories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

