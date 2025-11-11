import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPatch } from "../client";
import type { Note, CreateNoteResponse, NoteCostEstimate } from "../types";
import { USAGE_QUERY_KEY } from "./use-usage";

export const NOTES_QUERY_KEY = ["notes"] as const;
export const NOTES_INFINITE_QUERY_KEY = ["notes", "infinite"] as const;
export const NOTES_WITH_COLLECTIONS_QUERY_KEY = ["notes", "with-collections"] as const;

export interface NotesFilters {
  search?: string;
  category?: string | null;
  tag?: string | null;
  dateRange?: "week" | "month" | "all";
  sortBy?: "newest" | "oldest" | "category";
  pinned?: boolean | null;
}

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => apiGet<{ notes: Note[] }>("/api/notes"),
    select: (data) => data.notes,
  });
}

export function useNotesWithCollections() {
  return useQuery({
    queryKey: NOTES_WITH_COLLECTIONS_QUERY_KEY,
    queryFn: () => apiGet<{ notes: Note[] }>("/api/notes/with-collections"),
    select: (data) => data.notes,
  });
}

const NOTES_PAGE_SIZE = 6;

export function useNotesInfinite() {
  return useInfiniteQuery({
    queryKey: NOTES_INFINITE_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) =>
      apiGet<{ notes: Note[]; total: number }>(`/api/notes?limit=${NOTES_PAGE_SIZE}&offset=${pageParam}`),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.notes.length, 0);
      if (loadedCount >= lastPage.total) {
        return undefined;
      }
      return loadedCount;
    },
    initialPageParam: 0,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      notes: data.pages.flatMap((page) => page.notes),
      total: data.pages[0]?.total || 0,
    }),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, title, tags }: { content: string; title?: string; tags?: string[] }) =>
      apiPost<CreateNoteResponse>("/api/notes", { content, title, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      content,
      title,
      tags,
    }: {
      noteId: string;
      content: string;
      title?: string;
      tags?: string[];
    }) =>
      apiPatch<CreateNoteResponse>(`/api/notes/${noteId}`, { content, title, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
    },
  });
}

export function usePinnedNotesCount() {
  const { data: notes = [] } = useNotes();
  return notes.filter((note) => note.pinned).length;
}

export function useArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, archived }: { noteId: string; archived: boolean }) =>
      apiPatch<{ note: Note }>(`/api/notes/${noteId}`, { archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
    },
  });
}

export function useDuplicateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      apiPost<CreateNoteResponse>(`/api/notes/${noteId}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_INFINITE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
    },
  });
}
