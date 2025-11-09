import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPatch } from "../client";
import type { Note, CreateNoteResponse, NoteCostEstimate } from "../types";
import { USAGE_QUERY_KEY } from "./use-usage";

export const NOTES_QUERY_KEY = ["notes"] as const;

export interface NotesFilters {
  search?: string;
  category?: string;
  tag?: string;
  dateRange?: "week" | "month" | "all";
  sortBy?: "newest" | "oldest" | "category";
  pinned?: boolean;
}

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
    mutationFn: ({ content, tags }: { content: string; tags?: string[] }) =>
      apiPost<CreateNoteResponse>("/api/notes", { content, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => apiDelete(`/api/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      content,
      tags,
    }: {
      noteId: string;
      content: string;
      tags?: string[];
    }) =>
      apiPatch<CreateNoteResponse>(`/api/notes/${noteId}`, { content, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useEstimateNoteCost(content: string) {
  return useQuery({
    queryKey: ["note-cost-estimate", content],
    queryFn: () =>
      apiPost<NoteCostEstimate>("/api/notes/estimate-cost", { content }),
    enabled: content.length > 0,
    staleTime: 1000,
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, pinned }: { noteId: string; pinned: boolean }) =>
      apiPatch<{ note: Note }>(`/api/notes/${noteId}`, { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useFavoriteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, favorite }: { noteId: string; favorite: boolean }) =>
      apiPatch<{ note: Note }>(`/api/notes/${noteId}`, { favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function usePinnedNotesCount() {
  const { data: notes = [] } = useNotes();
  return notes.filter((note) => note.pinned).length;
}
