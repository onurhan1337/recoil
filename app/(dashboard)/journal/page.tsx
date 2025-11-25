"use client";

import { useState, useEffect } from "react";
import { startOfDay, addDays, subDays, isToday } from "date-fns";
import { useJournalEntries } from "@/lib/api/hooks";
import { DailyJournalDigest } from "@/components/journal/daily-journal-digest";
import { JournalEntryInput } from "@/components/journal/journal-entry-input";
import { JournalAnalytics } from "@/components/journal/journal-analytics";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const { data: entries = [], refetch } = useJournalEntries();

  // Keyboard navigation: Arrow keys to navigate between days
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedDate((prev) => subDays(prev, 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextDay = addDays(selectedDate, 1);
        // Don't allow future dates
        if (!isToday(nextDay) && nextDay > new Date()) {
          return;
        }
        setSelectedDate(nextDay);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate]);

  const handleEntryCreated = () => {
    refetch();
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-lora font-semibold tracking-tight mb-2">
          Journal
        </h1>
        <p className="text-muted-foreground tracking-wide font-lora text-sm">
          Every day.
        </p>
      </div>

      {/* Journal Analytics */}
      <JournalAnalytics />

      {/* Journal Entry Input */}
      <JournalEntryInput
        selectedDate={selectedDate}
        onEntryCreated={handleEntryCreated}
      />

      {/* Daily Journal Digest - with built-in date navigation */}
      <DailyJournalDigest
        entries={entries}
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(startOfDay(date))}
        onEntryCreated={handleEntryCreated}
      />
    </div>
  );
}
