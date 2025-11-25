"use client";

import { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdateDisplayName } from "@/lib/api/hooks";
import type { User } from "@supabase/supabase-js";

interface AccountSectionProps {
  user: User | null | undefined;
}

export function AccountSection({ user }: AccountSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const updateDisplayNameMutation = useUpdateDisplayName();

  const handleEditName = () => {
    setDisplayName(user?.user_metadata?.display_name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      toast.error("Cannot be empty");
      return;
    }

    try {
      await updateDisplayNameMutation.mutateAsync(displayName);
      toast.success("Saved");
      setIsEditingName(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleCancelEdit = () => {
    setDisplayName("");
    setIsEditingName(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-lora font-semibold tracking-tight mb-2">Account</h2>
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
  );
}
