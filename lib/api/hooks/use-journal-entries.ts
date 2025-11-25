import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { parseAsString } from "nuqs";
import { format, startOfDay, subDays, addDays } from "date-fns";
import { apiGet, apiPost, apiPatch, apiDelete } from "../client";
import type {
  CreateJournalEntryResponse,
  JournalEntriesResponse,
  JournalStatsResponse,
  PromoteJournalEntryResponse,
} from "../types";

export const JOURNAL_ENTRIES_QUERY_KEY = ["journal-entries"] as const;
export const JOURNAL_ENTRIES_STATS_QUERY_KEY = [
  "journal-entries",
  "stats",
] as const;
export const JOURNAL_HEATMAP_QUERY_KEY = [
  "journal-entries",
  "heatmap",
] as const;

export const journalDateParser = parseAsString.withDefault(
  format(startOfDay(new Date()), "yyyy-MM-dd")
);

export function useJournalEntries(date: string) {
  const queryKey = [...JOURNAL_ENTRIES_QUERY_KEY, date];

  return useQuery({
    queryKey,
    queryFn: () => {
      return apiGet<JournalEntriesResponse>(
        `/api/journal/entries?date=${date}`
      );
    },
    select: (data) => data.entries,
  });
}

export function usePrefetchAdjacentDates(selectedDate: Date) {
  const today = startOfDay(new Date());
  const prevDay = subDays(selectedDate, 1);
  const nextDay = addDays(selectedDate, 1);

  const queries = useMemo(() => {
    const queries = [];

    if (prevDay <= today) {
      queries.push({
        queryKey: [...JOURNAL_ENTRIES_QUERY_KEY, format(prevDay, "yyyy-MM-dd")],
        queryFn: () =>
          apiGet<JournalEntriesResponse>(
            `/api/journal/entries?date=${format(prevDay, "yyyy-MM-dd")}`
          ),
      });
    }

    if (nextDay <= today) {
      queries.push({
        queryKey: [...JOURNAL_ENTRIES_QUERY_KEY, format(nextDay, "yyyy-MM-dd")],
        queryFn: () =>
          apiGet<JournalEntriesResponse>(
            `/api/journal/entries?date=${format(nextDay, "yyyy-MM-dd")}`
          ),
      });
    }

    return queries;
  }, [selectedDate, today, prevDay, nextDay]);

  useQueries({
    queries: queries.map((query) => ({
      ...query,
      enabled: true,
      staleTime: 1000 * 60 * 5,
    })),
  });
}

export function useJournalStats() {
  return useQuery({
    queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
    queryFn: () => apiGet<JournalStatsResponse>("/api/journal/entries/stats"),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }: { content: string }) =>
      apiPost<CreateJournalEntryResponse>("/api/journal/entries", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiPatch<CreateJournalEntryResponse>(`/api/journal/entries/${id}`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<{ success: boolean }>(`/api/journal/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
      });
    },
  });
}

export function usePromoteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
      title,
      tags,
    }: {
      id: string;
      content?: string;
      title?: string;
      tags?: string[];
    }) =>
      apiPost<PromoteJournalEntryResponse>(
        `/api/journal/entries/${id}/promote`,
        {
          content,
          title,
          tags,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });
}
