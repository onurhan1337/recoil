import { useMemo } from "react";
import type { Note } from "../types";

export function useNotesAnalytics(notes: Note[]) {
  return useMemo(() => {
    if (!notes.length) return null;

    const categoryCount = notes.reduce((acc, note) => {
      const cat = note.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .filter(([, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const thisWeek = notes.filter((note) => {
      const noteDate = new Date(note.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    }).length;

    return {
      total: notes.length,
      thisWeek,
      topCategories,
    };
  }, [notes]);
}
