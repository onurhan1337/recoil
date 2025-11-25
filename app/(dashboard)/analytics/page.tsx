"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Brain, History, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useThinkingPatterns,
  useNotes,
  useAnalyses,
  useShareAnalysis,
  useUnshareAnalysis,
} from "@/lib/api/hooks";
import { isProPlan } from "@/lib/utils";
import { useDashboard } from "@/lib/contexts/dashboard-context";
import { Separator } from "@/components/ui/separator";
import { calculateAnalyticsData } from "@/lib/utils/analytics";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { AnalysisHistoryItem } from "@/components/analytics/analysis-history-item";
import { AnalyticsLoading } from "@/components/analytics/analytics-loading";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { HistoryEmptyState } from "@/components/analytics/history-empty-state";
import { ProFeatureLock } from "@/components/pro-feature-lock";
import { NotesOverTimeChart } from "@/components/analytics/notes-over-time-chart";
import { ActivityByDayChart } from "@/components/analytics/activity-by-day-chart";
import { CategoryDistributionChart } from "@/components/analytics/category-distribution-chart";
import { TopCategoriesChart } from "@/components/analytics/top-categories-chart";
import { InsightsDisplay } from "@/components/analytics/insights-display";

export default function AnalyticsPage() {
  const { usage } = useDashboard();
  const { data: notes = [] } = useNotes();
  const { data: analyses = [] } = useAnalyses();
  const isPro = isProPlan(usage?.plan);
  const [insights, setInsights] = useState<string | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "history">("current");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("90d");

  const thinkingPatternsMutation = useThinkingPatterns();
  const shareAnalysisMutation = useShareAnalysis();
  const unshareAnalysisMutation = useUnshareAnalysis();

  const analyticsData = useMemo(
    () => calculateAnalyticsData(notes, timeRange),
    [notes, timeRange]
  );

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await thinkingPatternsMutation.mutateAsync();
      setInsights(result.insights);
      setNoteCount(result.noteCount);
      setLastAnalyzed(new Date());
      setViewMode("current");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze thinking patterns"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const result = await shareAnalysisMutation.mutateAsync(id);
      const url = `${window.location.origin}/analytics/shared/${result.shareToken}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to share analysis:", err);
    }
  };

  const handleUnshare = async (id: string) => {
    try {
      await unshareAnalysisMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to unshare analysis:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground tracking-wide font-lora text-sm">
            Discover insights about your thinking patterns and note-taking
            habits
          </p>
        </div>
      </div>

      {!isPro && (
        <ProFeatureLock
          description="Upgrade to Pro to unlock thinking patterns analysis and gain insights into your note-taking habits."
        />
      )}

      {isPro && (
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border w-fit">
            <Button
              onClick={() => setViewMode("current")}
              variant={viewMode === "current" ? "default" : "ghost"}
              size="sm"
              className="gap-2 rounded-md"
            >
              <Brain className="h-4 w-4" />
              Current Analysis
            </Button>
            <Button
              onClick={() => setViewMode("history")}
              variant={viewMode === "history" ? "default" : "ghost"}
              size="sm"
              className="gap-2 rounded-md"
            >
              <History className="h-4 w-4" />
              History
              {analyses.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {analyses.length}
                </span>
              )}
            </Button>
          </div>

          {viewMode === "history" && (
            <div className="space-y-4">
              {analyses.length === 0 ? (
                <HistoryEmptyState />
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <AnalysisHistoryItem
                      key={analysis.id}
                      analysis={analysis}
                      copiedId={copiedId}
                      onShare={handleShare}
                      onUnshare={handleUnshare}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === "current" && (
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 border border-primary/20">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-lora">
                        Thinking Patterns
                      </CardTitle>
                      <CardDescription className="mt-1">
                        AI-powered analysis of your recent notes
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    {insights ? "Re-analyze" : "Analyze"}
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-6">
                {isLoading && <AnalyticsLoading />}

                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-destructive/20 p-1.5 mt-0.5">
                        <Lock className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive mb-1">
                          Error
                        </p>
                        <p className="text-sm text-destructive/80">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading && !error && insights && (
                  <div className="space-y-6">
                    <InsightsDisplay insights={insights} />

                    {analyticsData && (
                      <>
                        <MetricsCards
                          totalNotes={analyticsData.metrics.totalNotes}
                          growthRate={analyticsData.metrics.growthRate}
                          avgNotesPerDay={analyticsData.metrics.avgNotesPerDay}
                          mostActiveDay={analyticsData.metrics.mostActiveDay}
                          categoryCount={analyticsData.categoryData.length}
                          timeRange={timeRange}
                        />

                        <NotesOverTimeChart
                          data={analyticsData.notesOverTime}
                          timeRange={timeRange}
                          onTimeRangeChange={setTimeRange}
                        />

                        <div className="grid gap-6 lg:grid-cols-2">
                          <ActivityByDayChart
                            data={analyticsData.dayOfWeekData}
                          />
                          <CategoryDistributionChart
                            data={analyticsData.radarData}
                          />
                        </div>

                        <TopCategoriesChart
                          data={analyticsData.topCategories}
                        />
                      </>
                    )}
                  </div>
                )}

                {!isLoading &&
                  !error &&
                  !insights &&
                  analyticsData &&
                  analyticsData.notesOverTime.length > 0 && (
                    <div className="space-y-6">
                      <MetricsCards
                        totalNotes={analyticsData.metrics.totalNotes}
                        growthRate={analyticsData.metrics.growthRate}
                        avgNotesPerDay={analyticsData.metrics.avgNotesPerDay}
                        mostActiveDay={analyticsData.metrics.mostActiveDay}
                        categoryCount={analyticsData.categoryData.length}
                        timeRange={timeRange}
                      />

                      <NotesOverTimeChart
                        data={analyticsData.notesOverTime}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                      />

                      <div className="grid gap-6 lg:grid-cols-2">
                        <ActivityByDayChart
                          data={analyticsData.dayOfWeekData}
                        />
                        <CategoryDistributionChart
                          data={analyticsData.radarData}
                        />
                      </div>

                      <TopCategoriesChart data={analyticsData.topCategories} />
                    </div>
                  )}

                {!isLoading &&
                  !error &&
                  !insights &&
                  (!analyticsData ||
                    analyticsData.notesOverTime.length === 0) && (
                    <AnalyticsEmptyState onAnalyze={handleAnalyze} />
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
