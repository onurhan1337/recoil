"use client";

import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { startOfDay, addDays, subDays, isToday } from "date-fns";
import {
  JOURNAL_ENTRIES_QUERY_KEY,
  JOURNAL_ENTRIES_STATS_QUERY_KEY,
  useJournalEntries,
} from "@/lib/api/hooks";
import { DailyJournalDigest } from "@/components/journal/daily-journal-digest";
import { JournalEntryInput } from "@/components/journal/journal-entry-input";
import { JournalAnalytics } from "@/components/journal/journal-analytics";
import { queryClient } from "@/lib/query-client";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const { data: entries = [] } = useJournalEntries();

  useHotkeys(
    "arrowleft",
    (e) => {
      e.preventDefault();
      setSelectedDate((prev) => subDays(prev, 1));
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    }
  );

  useHotkeys(
    "arrowright",
    (e) => {
      e.preventDefault();
      const nextDay = addDays(selectedDate, 1);
      if (!isToday(nextDay) && nextDay > new Date()) {
        return;
      }
      setSelectedDate(nextDay);
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
    [selectedDate]
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
          Journal
        </h1>
        <p className="text-muted-foreground tracking-wide font-lora text-sm">
          Every day.
        </p>
      </div>

      <JournalAnalytics />

      <JournalEntryInput
        onEntryCreated={() => {
          queryClient.invalidateQueries({
            queryKey: JOURNAL_ENTRIES_QUERY_KEY,
          });
          queryClient.invalidateQueries({
            queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
          });
        }}
      />

      <DailyJournalDigest
        entries={entries}
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(startOfDay(date))}
      />
    </div>
  );
}
