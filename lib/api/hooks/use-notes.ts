import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../client";
import type { Note, CreateNoteResponse } from "../types";
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
