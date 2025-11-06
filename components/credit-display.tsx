"use client";

import { useMemo } from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { UpgradePlanDialog } from "./upgrade-plan-dialog";
import { calculateCreditPercentage, cn } from "@/lib/utils";

interface CreditDisplayProps {
  credits: number;
  plan?: "free" | "pro";
  monthlyLimit?: number;
  showUpgrade?: boolean;
}

function getCreditColor(credits: number, monthlyLimit: number): string {
  const percentage = calculateCreditPercentage(credits, monthlyLimit);

  if (percentage < 20) return "text-red-500";
  if (percentage > 80) return "text-green-500";
  if (percentage >= 20 && percentage <= 80) return "text-yellow-500";

  return "text-muted-foreground";
}

export function CreditDisplay({
  credits,
  plan = "free",
  monthlyLimit = 500,
  showUpgrade = false,
}: CreditDisplayProps) {
  const isFree = plan === "free";
  const creditColor = useMemo(
    () => getCreditColor(credits, monthlyLimit),
    [credits, monthlyLimit]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge
          variant={plan === "pro" ? "default" : "secondary"}
          className="text-xs font-medium"
        >
          {plan === "pro" ? "Pro" : "Free"}
        </Badge>
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className={cn("h-3.5 w-3.5", creditColor)} />
          <span className={creditColor}>{credits.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs">
            / {monthlyLimit.toLocaleString()}
          </span>
        </div>
      </div>
      {showUpgrade && isFree && (
        <UpgradePlanDialog
          trigger={
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors">
              <Zap className="h-3 w-3" />
              Upgrade to Pro
              <ArrowUpRight className="h-3 w-3" />
            </button>
          }
        />
      )}
    </div>
  );
}
