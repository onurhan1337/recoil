import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPatch } from "../client";
import type { Note, CreateNoteResponse, NoteCostEstimate } from "../types";
import { USAGE_QUERY_KEY } from "./use-usage";

export const NOTES_QUERY_KEY = ["notes"] as const;

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => apiGet<{ notes: Note[] }>("/api/notes"),
    select: (data) => data.notes,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      apiPost<CreateNoteResponse>("/api/notes", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      apiDelete(`/api/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      apiPatch<CreateNoteResponse>(`/api/notes/${noteId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
    },
  });
}

export function useEstimateNoteCost(content: string) {
  return useQuery({
    queryKey: ["note-cost-estimate", content],
    queryFn: () => apiPost<NoteCostEstimate>("/api/notes/estimate-cost", { content }),
    enabled: content.length > 0,
    staleTime: 1000,
  });
}
