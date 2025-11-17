"use client";

import { useState } from "react";
import { Zap, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUsage } from "@/lib/api/hooks";
import { isProPlan } from "@/lib/api/utils";
import { config } from "@/lib/config";

interface UpgradePlanDialogProps {
  trigger?: React.ReactNode;
}

export function UpgradePlanDialog({ trigger }: UpgradePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { data: usage } = useUsage();
  const isPro = isProPlan(usage?.plan);

  const handleUpgrade = async () => {
    try {
      setIsCheckoutLoading(true);
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Failed to create checkout session";
        toast.error("Checkout failed", {
          description: errorMessage,
        });
        setIsCheckoutLoading(false);
        return;
      }

      const { checkoutUrl } = await response.json();

      window.location.href = checkoutUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Checkout failed", {
        description: errorMessage,
      });
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline underline-offset-4">
            <Zap className="h-4 w-4" />
            Upgrade
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade to Pro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2 pb-2">
            <p className="text-sm text-muted-foreground">
              Unlock powerful AI features and advanced analytics
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border-2 border-border p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Free</h3>
                  {!isPro && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">forever</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {config.plans.free.monthlyCredits.toLocaleString()}{" "}
                    credits/month
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {config.plans.free.costs.createNote} credits per note
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {config.plans.free.costs.chatMessage} credits per chat
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {config.plans.free.features.maxTemplates} custom template
                    {config.plans.free.features.maxTemplates !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {config.plans.free.features.emailReminders
                      ? "Email & in-app reminders"
                      : "In-app reminders only"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>Basic features</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-foreground p-5 space-y-4 bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  {isPro && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {config.plans.pro.price?.split("/")[0] || "$4.99"}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {config.plans.pro.monthlyCredits.toLocaleString()}{" "}
                    credits/month
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {config.plans.pro.costs.createNote} credit
                    {config.plans.pro.costs.createNote !== 1 ? "s" : ""} per
                    note
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {config.plans.pro.costs.chatMessage} credits per chat
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {config.plans.pro.features.maxTemplates === -1
                      ? "Unlimited custom templates"
                      : `${
                          config.plans.pro.features.maxTemplates
                        } custom template${
                          config.plans.pro.features.maxTemplates !== 1
                            ? "s"
                            : ""
                        }`}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {config.plans.pro.features.emailReminders
                      ? "Email & in-app reminders"
                      : "In-app reminders only"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    Advanced analytics dashboard
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    AI-powered note connections
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">
                    Thinking patterns analysis
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">Share analysis insights</span>
                </div>
              </div>
              {!isPro && (
                <button
                  onClick={handleUpgrade}
                  disabled={isCheckoutLoading}
                  className="w-full py-2.5 px-4 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium mb-2">All plans include:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>Smart note organization</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>AI-powered categorization</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>Tags & filters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>Note templates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>Export (JSON & Markdown)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>Search & discovery</span>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <p>Cancel anytime • No hidden fees • Instant activation</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
