"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJournalStats } from "@/lib/api/hooks";

const STREAK_THRESHOLDS = [
  [0, "Start today."],
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

const MILESTONE_NOTIFICATIONS = [
  [7, "Day by day."],
  [14, "Week by week."],
  [21, "Still going."],
  [30, "A month of days."],
  [60, "Two months of days."],
  [90, "Three months of days."],
  [180, "Six months of days."],
  [365, "A year of days."],
] as const;

const MILESTONE_MAP = Object.fromEntries(MILESTONE_NOTIFICATIONS);

export function JournalAnalytics() {
  const { data: stats, isLoading } = useJournalStats();
  const [notificationVisible, setNotificationVisible] = useState(true);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const { streak } = stats;

  const getStreakMessage = () => {
    if (streak === 0) {
      return STREAK_THRESHOLDS[0][1];
    }
    const [, message] =
      STREAK_THRESHOLDS.find(([threshold]) => streak < threshold) ||
      STREAK_THRESHOLDS[STREAK_THRESHOLDS.length - 1];
    return streak === 1 ? message : `${streak} days. ${message}`;
  };

  const notification =
    streak > 0 && MILESTONE_MAP[streak] ? MILESTONE_MAP[streak] : null;

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

      <AnimatePresence mode="wait">
        {notification && notificationVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pt-2"
          >
            <p className="text-xs text-muted-foreground/70 font-lora leading-relaxed text-center tracking-wide italic">
              {notification}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!notification && (
        <div className="pt-4 animate-fade-in">
          <p className="text-sm text-muted-foreground/80 font-lora leading-relaxed text-center tracking-wide">
            {getStreakMessage()}
          </p>
        </div>
      )}
    </div>
  );
}
