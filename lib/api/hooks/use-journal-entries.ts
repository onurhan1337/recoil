import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useJournalEntries(date?: string) {
  const queryKey = date
    ? [...JOURNAL_ENTRIES_QUERY_KEY, date]
    : JOURNAL_ENTRIES_QUERY_KEY;

  return useQuery({
    queryKey,
    queryFn: () => {
      const url = date
        ? `/api/journal/entries?date=${date}`
        : "/api/journal/entries";
      return apiGet<JournalEntriesResponse>(url);
    },
    select: (data) => data.entries,
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
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ENTRIES_STATS_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });
}
