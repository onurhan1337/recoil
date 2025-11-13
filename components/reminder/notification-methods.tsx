"use client";

import { Mail, Smartphone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NotificationMethodsProps } from "./types";

export function NotificationMethods({
  emailEnabled,
  inAppEnabled,
  onEmailChange,
  onInAppChange,
  disabled,
}: NotificationMethodsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Notification Methods</Label>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground">
              Send reminder via email
            </p>
          </div>
        </div>
        <Switch
          checked={emailEnabled}
          onCheckedChange={onEmailChange}
          disabled={disabled}
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
