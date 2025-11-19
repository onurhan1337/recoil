"use client";

import { useNotes } from "@/lib/api/hooks";
import { useExportNotes } from "@/lib/api/hooks/use-export-notes";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";
import { AccountSection } from "@/components/account-section";
import { UsageSection } from "@/components/usage-section";
import { ExportNotesSection } from "@/components/export-notes-section";
import { useDashboard } from "@/lib/contexts/dashboard-context";

export default function SettingsPage() {
  const { user, usage } = useDashboard();
  const { data: notes = [] } = useNotes();
  const { isExporting, exportAsJSON, exportAsMarkdown } = useExportNotes(
    notes,
    user?.email ?? undefined
  );

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl tracking-tight font-lora text-foreground font-semibold">
          Settings
        </h1>
        <UpgradePlanDialog />
      </div>

      <div className="space-y-8">
        <AccountSection user={user} />
        <UsageSection usage={usage ?? undefined} />
        <ExportNotesSection
          notes={notes}
          isExporting={isExporting}
          onExportJSON={exportAsJSON}
          onExportMarkdown={exportAsMarkdown}
        />
      </div>
    </div>
  );
}
