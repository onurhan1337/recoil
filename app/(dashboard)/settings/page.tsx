"use client";

import { useUser, useUsage } from "@/lib/api/hooks";

export default function SettingsPage() {
  const { data: user } = useUser();
  const { data: usage } = useUsage();

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-medium tracking-tight">Settings</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">Account</h2>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email || "Loading..."}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Usage</h2>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits</span>
              <span className="text-sm font-medium">{usage?.credits ?? 0}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Each search uses 1 credit. Search uses GPT-4o-mini for summaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
