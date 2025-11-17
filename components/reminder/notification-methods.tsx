"use client";

import { Mail, Smartphone, Crown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { NotificationMethodsProps } from "./types";

export function NotificationMethods({
  emailEnabled,
  inAppEnabled,
  onEmailChange,
  onInAppChange,
  disabled,
  isPro = false,
}: NotificationMethodsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Notification Methods</Label>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors relative">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Email</p>
              {!isPro && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 gap-0.5"
                >
                  <Crown className="h-2.5 w-2.5" />
                  Pro
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPro
                ? "Send reminder via email"
                : "Upgrade to Pro for email reminders"}
            </p>
          </div>
        </div>
        <Switch
          checked={isPro ? emailEnabled : false}
          onCheckedChange={isPro ? onEmailChange : undefined}
          disabled={disabled || !isPro}
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">In-App</p>
            <p className="text-xs text-muted-foreground">
              Show notification in app
            </p>
          </div>
        </div>
        <Switch
          checked={inAppEnabled}
          onCheckedChange={onInAppChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
