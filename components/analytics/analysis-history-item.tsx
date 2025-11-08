"use client";

import { Brain, FileText, Calendar, Share2, Check, Copy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Analysis } from "@/lib/api/hooks/use-analyses";

interface AnalysisHistoryItemProps {
  analysis: Analysis;
  copiedId: string | null;
  onShare: (id: string) => void;
  onUnshare: (id: string) => void;
}

export function AnalysisHistoryItem({
  analysis,
  copiedId,
  onShare,
  onUnshare,
}: AnalysisHistoryItemProps) {
  const createdDate = new Date(analysis.created_at);
  const isRecent =
    Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card className="group border hover:border-foreground/20 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 border border-primary/20 shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium font-lora">
                      {createdDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      at{" "}
                      {createdDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {analysis.is_public && analysis.share_token && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Share2 className="h-3 w-3" />
                        Shared
                      </Badge>
                    )}
                    {isRecent && (
                      <Badge
                        variant="secondary"
                        className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      >
                        <Sparkles className="h-3 w-3" />
                        Recent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border text-xs">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{analysis.note_count} notes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border text-xs">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(analysis.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(analysis.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {analysis.is_public && analysis.share_token ? (
                <>
                  <Button
                    onClick={() => onShare(analysis.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedId === analysis.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => onUnshare(analysis.id)}
                    variant="outline"
                    size="sm"
                  >
                    Unshare
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onShare(analysis.id)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>
          <Separator />
          <div className="rounded-lg bg-muted/30 p-5 border prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={analysis.insights} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

