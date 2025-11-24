import { useMemo } from "react";
import type { Note } from "../types";
import { getTopCategories } from "@/lib/utils/top-categories";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../client";
import { NOTES_ANALYTICS_QUERY_KEY } from "./use-notes";

export function useNotesAnalyticsQuery() {
  return useQuery({
    queryKey: NOTES_ANALYTICS_QUERY_KEY,
    queryFn: () =>
      apiGet<{ notes: Pick<Note, "id" | "category" | "created_at">[] }>(
        "/api/notes?analytics=true"
      ).then((res) => res.notes),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNotesAnalytics<
  T extends Pick<Note, "id" | "category" | "created_at">
>(notes: T[]) {
  return useMemo(() => {
    if (!notes.length) return null;

    const topCategories = getTopCategories(notes);

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
