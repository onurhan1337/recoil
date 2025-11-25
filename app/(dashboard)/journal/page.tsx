"use client";

import { useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useQueryState } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import {
  startOfDay,
  addDays,
  subDays,
  isToday,
  format,
  parseISO,
} from "date-fns";
import {
  JOURNAL_ENTRIES_QUERY_KEY,
  JOURNAL_ENTRIES_STATS_QUERY_KEY,
  journalDateParser,
  usePrefetchAdjacentDates,
} from "@/lib/api/hooks";
import { DailyJournalDigest } from "@/components/journal/daily-journal-digest";
import { JournalEntryInput } from "@/components/journal/journal-entry-input";
import { JournalAnalytics } from "@/components/journal/journal-analytics";

export default function JournalPage() {
  const queryClient = useQueryClient();
  const [dateString, setDateString] = useQueryState("date", journalDateParser);

  const selectedDate = useMemo(() => {
    return startOfDay(parseISO(dateString));
  }, [dateString]);

  usePrefetchAdjacentDates(selectedDate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const target = e.target as HTMLElement;
        const isInputFocused =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (!isInputFocused) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useHotkeys(
    "arrowleft",
    (e) => {
      e.preventDefault();
      const prevDay = subDays(selectedDate, 1);
      setDateString(format(prevDay, "yyyy-MM-dd"));
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
    [selectedDate, setDateString]
  );

  useHotkeys(
    "arrowright",
    (e) => {
      e.preventDefault();
      const nextDay = addDays(selectedDate, 1);
      const today = startOfDay(new Date());
      if (!isToday(nextDay) && nextDay > today) {
        return;
      }
      setDateString(format(nextDay, "yyyy-MM-dd"));
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
    [selectedDate, setDateString]
  );

  const handleDateSelect = (date: Date) => {
    setDateString(format(startOfDay(date), "yyyy-MM-dd"));
  };

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
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}
