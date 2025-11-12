import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPatch } from "../client";
import type { Collection } from "../types";
import { NOTES_WITH_COLLECTIONS_QUERY_KEY } from "./use-notes";

export const COLLECTIONS_QUERY_KEY = ["collections"] as const;

export function useCollections() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: () => apiGet<{ collections: Collection[] }>("/api/collections"),
    select: (data) => data.collections,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      color,
    }: {
      name: string;
      description?: string;
      color?: string;
    }) => apiPost<{ collection: Collection }>("/api/collections", { name, description, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      name,
      description,
      color,
    }: {
      collectionId: string;
      name?: string;
      description?: string;
      color?: string;
    }) =>
      apiPatch<{ collection: Collection }>(`/api/collections/${collectionId}`, {
        name,
        description,
        color,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => apiDelete(`/api/collections/${collectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useAddNoteToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, noteId }: { collectionId: string; noteId: string }) =>
      apiPost(`/api/collections/${collectionId}/notes`, { noteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_WITH_COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useRemoveNoteFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, noteId }: { collectionId: string; noteId: string }) =>
      apiDelete(`/api/collections/${collectionId}/notes`, { noteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_WITH_COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useBulkAddNotesToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, noteIds }: { collectionId: string; noteIds: string[] }) =>
      apiPost<{
        success: boolean;
        addedCount: number;
        skippedCount?: number;
        message?: string;
      }>("/api/collections/bulk-add-notes", {
        collectionId,
        noteIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_WITH_COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useBulkRemoveNotesFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, noteIds }: { collectionId: string; noteIds: string[] }) =>
      apiPost<{ success: boolean; removedCount: number }>(
        "/api/collections/bulk-remove-notes",
        {
          collectionId,
          noteIds,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_WITH_COLLECTIONS_QUERY_KEY });
    },
  });
}
