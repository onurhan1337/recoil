"use client";

import { use, useEffect, useState } from "react";
import { Brain, FileText, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InsightsDisplay } from "@/components/analytics/insights-display";
import { useRouter } from "next/navigation";

interface SharedAnalysis {
  insights: string;
  note_count: number;
  created_at: string;
  start_date: string;
  end_date: string;
}

export default function SharedAnalysisPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SharedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedAnalysis() {
      try {
        const response = await fetch(`/api/analytics/analyses/shared/${resolvedParams.token}`);

        if (!response.ok) {
          throw new Error("Analysis not found");
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shared analysis");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSharedAnalysis();
  }, [resolvedParams.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-3 border-muted-foreground/20 border-t-primary mx-auto" />
            <Brain className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">Loading shared analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-4 mx-auto w-fit">
                <Brain className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analysis Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  {error || "This shared analysis link is invalid or has been removed."}
                </p>
              </div>
              <Button onClick={() => router.push("/analytics")}>
                Go to Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
            Shared Analysis
          </h1>
          <p className="text-muted-foreground tracking-wide font-lora text-sm">
            AI-powered thinking patterns insights
          </p>
        </div>
        <Button
          onClick={() => router.push("/analytics")}
          variant="outline"
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View Your Analytics
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 border border-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Thinking Patterns Analysis</CardTitle>
              <CardDescription className="mt-1">
                Generated on {new Date(analysis.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          <InsightsDisplay insights={analysis.insights} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-2 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Notes Analyzed
                      </p>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {analysis.note_count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From the analysis period
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Analysis Period
                      </p>
                    </div>
                    <p className="text-sm font-semibold leading-tight">
                      {new Date(analysis.start_date).toLocaleDateString()} - {new Date(analysis.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Date range analyzed
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
