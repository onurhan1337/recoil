"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";

export function ProUpgradeCard() {
  return (
    <Card className="border-2 border-dashed bg-gradient-to-br from-muted/50 to-muted/30">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4 border-2 border-dashed">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Pro Feature</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Upgrade to Pro to unlock thinking patterns analysis and gain
              insights into your note-taking habits.
            </p>
          </div>
          <UpgradePlanDialog
            trigger={<Button className="mt-2">Upgrade to Pro</Button>}
          />
        </div>
      </CardContent>
    </Card>
  );
}

