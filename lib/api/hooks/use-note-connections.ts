import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../client";

export interface NoteConnection {
  id: string;
  content: string;
  label?: string | null;
  category?: string | null;
  created_at: string;
  similarity: number;
}

export interface NoteConnectionsResponse {
  connections: NoteConnection[];
}

export function useNoteConnections(noteId: string | null) {
  return useQuery({
    queryKey: ["note-connections", noteId],
    queryFn: () =>
      apiGet<NoteConnectionsResponse>(`/api/notes/${noteId}/connections`),
    enabled: !!noteId,
    select: (data) => data.connections,
  });
}
