"use client";

import { useJournalStats } from "@/lib/api/hooks";

const STREAK_THRESHOLDS = [
  [1, "A single entry. A great story begins."],
  [4, "Building."],
  [7, "Momentum."],
  [14, "Rhythm."],
  [21, "Habit."],
  [30, "Consistency."],
  [60, "Discipline."],
  [90, "Commitment."],
  [180, "Transformation."],
  [365, "Mastery."],
  [Infinity, "Remarkable."],
] as const;

export function JournalAnalytics() {
  const { data: stats, isLoading } = useJournalStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { streak } = stats;

  const getStreakMessage = () => {
    const [, message] =
      STREAK_THRESHOLDS.find(([threshold]) => streak < threshold) ||
      STREAK_THRESHOLDS[STREAK_THRESHOLDS.length - 1];
    return streak === 1 ? message : `${streak} days. ${message}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-normal text-muted-foreground/60 uppercase tracking-widest">
            Streak
          </p>
          <p
            className={`text-5xl font-light tracking-[-0.02em] ${
              streak > 0 ? "animate-gentle-pulse" : ""
            }`}
          >
            {streak}
          </p>
        </div>
      </div>

      {streak > 0 && (
        <div className="pt-4 animate-fade-in">
          <p className="text-sm text-muted-foreground/80 font-lora leading-relaxed text-center tracking-wide">
            {getStreakMessage()}
          </p>
        </div>
      )}
    </div>
  );
}
