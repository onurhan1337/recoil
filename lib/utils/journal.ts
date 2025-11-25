import type { JournalEntry } from "@/lib/api/types";
import { startOfDay, isSameDay, format } from "date-fns";
import { Sun, Sunset, Moon } from "lucide-react";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export const timeOfDayConfig = {
  morning: {
    label: "Morning",
    icon: Sun,
  },
  afternoon: {
    label: "Afternoon",
    icon: Sun,
  },
  evening: {
    label: "Evening",
    icon: Sunset,
  },
  night: {
    label: "Night",
    icon: Moon,
  },
} as const;

export function getTimeOfDay(item: { created_at: string }): TimeOfDay {
  const itemDate = new Date(item.created_at);
  const hour = itemDate.getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export function groupByTimeOfDay<T extends { created_at: string }>(
  items: T[]
): Record<TimeOfDay, T[]> {
  const grouped: Record<TimeOfDay, T[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };

  if (!items || items.length === 0) return grouped;

  for (const item of items) {
    const timeOfDay = getTimeOfDay(item);
    grouped[timeOfDay].push(item);
  }

  return grouped;
}

export function getJournalEntriesForDate(
  entries: JournalEntry[],
  date: Date
): JournalEntry[] {
  if (!entries || entries.length === 0) return [];

  const targetDateKey = format(startOfDay(date), "yyyy-MM-dd");

  return entries.filter((entry) => {
    const entryDateKey = format(
      startOfDay(new Date(entry.created_at)),
      "yyyy-MM-dd"
    );
    return entryDateKey === targetDateKey;
  });
}
