"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };

    const getCredits = async () => {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    };

    getUser();
    getCredits();
  }, [supabase.auth]);

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-medium tracking-tight">Settings</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">Account</h2>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{userEmail || "Loading..."}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Usage</h2>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits</span>
              <span className="text-sm font-medium">{credits}</span>
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
