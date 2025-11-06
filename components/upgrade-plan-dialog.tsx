"use client";

import { useState } from "react";
import { Zap, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUsage } from "@/lib/api/hooks";

interface UpgradePlanDialogProps {
  trigger?: React.ReactNode;
}

export function UpgradePlanDialog({ trigger }: UpgradePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: usage } = useUsage();
  const currentPlan = usage?.plan || "free";
  const isPro = currentPlan === "pro";

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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border-2 border-border p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Free</h3>
                  {!isPro && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
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
                  <span>500 credits/month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>2 credits per note</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>5 credits per chat</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-foreground p-5 space-y-4 bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  {isPro && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$9</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">10,000 credits/month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">1 credit per note</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">3 credits per chat</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">Analytics dashboard</span>
                </div>
              </div>
              {!isPro && (
                <button className="w-full py-2.5 px-4 rounded-md text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>Cancel anytime • No hidden fees • Instant activation</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
