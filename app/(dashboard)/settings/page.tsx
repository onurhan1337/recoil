"use client";

import { useState } from "react";
import { useUser, useUpdateDisplayName, useUsage } from "@/lib/api/hooks";
import { CreditDisplay } from "@/components/credit-display";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: user } = useUser();
  const { data: usage } = useUsage();
  const updateDisplayNameMutation = useUpdateDisplayName();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const handleEditName = () => {
    setDisplayName(user?.user_metadata?.display_name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    try {
      await updateDisplayNameMutation.mutateAsync(displayName);
      toast.success("Display name updated successfully");
      setIsEditingName(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update display name");
    }
  };

  const handleCancelEdit = () => {
    setDisplayName("");
    setIsEditingName(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <UpgradePlanDialog />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">Account</h2>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user?.email || "Loading..."}</span>
            </div>
            <div className="pt-3 border-t">
              {isEditingName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-[100px]">Display Name</span>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      className="h-8 text-sm"
                      maxLength={50}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={updateDisplayNameMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={updateDisplayNameMutation.isPending || !displayName.trim()}
                    >
                      {updateDisplayNameMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Display Name</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{user?.user_metadata?.display_name || "Not set"}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditName}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Plan & Usage</h2>
          <div className="rounded-lg border border-border p-4 space-y-4">
            <CreditDisplay
              credits={usage?.credits ?? 0}
              plan={usage?.plan ?? "free"}
              monthlyLimit={usage?.monthly_credits_limit ?? 500}
              showUpgrade={false}
            />
            <div className="pt-3 border-t space-y-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Current costs:</span>
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Create note: {usage?.plan === "pro" ? config.plans.pro.costs.createNote : config.plans.free.costs.createNote} credits</div>
                <div>• Chat message: {usage?.plan === "pro" ? config.plans.pro.costs.chatMessage : config.plans.free.costs.chatMessage} credits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
