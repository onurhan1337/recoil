"use client";

import { CreditDisplay } from "@/components/credit-display";
import { config } from "@/lib/config";
import type { UsageResponse } from "@/lib/api/types";

interface UsageSectionProps {
  usage: UsageResponse | undefined;
}

export function UsageSection({ usage }: UsageSectionProps) {
  const plan = usage?.plan ?? "free";
  const planConfig = config.plans[plan as "free" | "pro"];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Plan & Usage</h2>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <CreditDisplay
          credits={usage?.credits ?? 0}
          plan={plan}
          monthlyLimit={usage?.monthly_credits_limit ?? 500}
          showUpgrade={false}
        />
        <div className="pt-3 border-t space-y-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Current costs:</span>
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Create note: {planConfig.costs.createNote} credits</div>
            <div>• Chat message: {planConfig.costs.chatMessage} credits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
