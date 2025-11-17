"use client";

import { useState } from "react";
import { CreditDisplay } from "@/components/credit-display";
import { config } from "@/lib/config";
import type { UsageResponse, UserPlan } from "@/lib/api/types";
import {
  Settings,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { isProPlan } from "@/lib/utils";

const SUBSCRIPTION_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  active: {
    label: "Active",
    variant: "default",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  trialing: {
    label: "Trial",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  canceled: {
    label: "Canceled",
    variant: "outline",
    icon: <Calendar className="h-3 w-3" />,
  },
  cancelled: {
    label: "Canceled",
    variant: "outline",
    icon: <Calendar className="h-3 w-3" />,
  },
  expired: {
    label: "Expired",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
  },
  revoked: {
    label: "Revoked",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
  },
};

interface UsageSectionProps {
  usage: UsageResponse | undefined;
}

export function UsageSection({ usage }: UsageSectionProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const plan: UserPlan = usage?.plan ?? "free";
  const planConfig = config.plans[plan];
  const isPro = isProPlan(plan);
  const hasSubscription = !!usage?.polar_subscription_id;

  const handleManageSubscription = async () => {
    try {
      setIsLoadingPortal(true);
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to open customer portal";
        toast.error("Portal error", {
          description: errorMessage,
        });
        setIsLoadingPortal(false);
        return;
      }

      const { url } = await response.json();

      if (!url || typeof url !== "string") {
        toast.error("Invalid portal URL", {
          description: "Please try again later.",
        });
        setIsLoadingPortal(false);
        return;
      }

      try {
        const parsedUrl = new URL(url);

        if (parsedUrl.protocol !== "https:") {
          toast.error("Invalid portal URL", {
            description: "Please try again later.",
          });
          setIsLoadingPortal(false);
          return;
        }

        if (!(config.polar.allowedPortalHostnames as readonly string[]).includes(parsedUrl.hostname)) {
          toast.error("Invalid portal URL", {
            description: "Please try again later.",
          });
          setIsLoadingPortal(false);
          return;
        }

        window.location.href = url;
      } catch {
        toast.error("Invalid portal URL", {
          description: "Please try again later.",
        });
        setIsLoadingPortal(false);
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Portal error", {
        description: errorMessage,
      });
      setIsLoadingPortal(false);
    }
  };

  const getSubscriptionStatusBadge = () => {
    if (!isPro || !usage?.subscription_status) return null;

    const status = usage.subscription_status;

    const config = SUBSCRIPTION_STATUS_CONFIG[status] ?? {
      label: status,
      variant: "secondary" as const,
      icon: null,
    };

    return (
      <Badge
        variant={config.variant}
        className="flex items-center gap-1 text-xs"
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatPeriodEnd = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Plan & Usage</h2>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <CreditDisplay
            credits={usage?.credits ?? 0}
            plan={plan}
            monthlyLimit={usage?.monthly_credits_limit ?? 500}
            showUpgrade={false}
          />
          {isPro && hasSubscription && (
            <button
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Settings className="h-3.5 w-3.5" />
                  Manage
                </>
              )}
            </button>
          )}
        </div>

        {isPro && usage?.subscription_status && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                Subscription Status
              </p>
              {getSubscriptionStatusBadge()}
            </div>
            {(() => {
              const formatted = formatPeriodEnd(usage?.subscription_period_end);
              if (!formatted) return null;
              return (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {usage?.subscription_status === "canceled" ||
                    usage?.subscription_status === "cancelled"
                      ? "Active until"
                      : "Renews on"}{" "}
                    {formatted}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

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
