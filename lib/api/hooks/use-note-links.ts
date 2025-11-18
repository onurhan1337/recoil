import useSWR, { mutate } from "swr";

interface NoteLink {
  linkId: string;
  linkType: "manual" | "semantic" | "collection" | "tag";
  direction: "outgoing" | "incoming";
  createdAt: string;
  note: {
    id: string;
    content: string;
    category: string | null;
    label: string | null;
    createdAt: string;
  };
}

interface UseNoteLinksResponse {
  data: NoteLink[] | undefined;
  isLoading: boolean;
  error: any;
  createLink: (targetNoteId: string) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
}

export function useNoteLinks(noteId: string | null): UseNoteLinksResponse {
  const { data, error, isLoading } = useSWR<{ data: NoteLink[] }>(
    noteId ? `/api/notes/${noteId}/links` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch note links");
      }
      return res.json();
    }
  );

  const createLink = async (targetNoteId: string) => {
    if (!noteId) throw new Error("Note ID is required");

    const res = await fetch(`/api/notes/${noteId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetNoteId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create link");
    }

    // Revalidate the links for both notes
    await mutate(`/api/notes/${noteId}/links`);
    await mutate(`/api/notes/${targetNoteId}/links`);
  };

  const deleteLink = async (linkId: string) => {
    if (!noteId) throw new Error("Note ID is required");

    const res = await fetch(`/api/notes/${noteId}/links/${linkId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete link");
    }

    // Revalidate the links
    await mutate(`/api/notes/${noteId}/links`);
  };

  return {
    data: data?.data,
    isLoading,
    error,
    createLink,
    deleteLink,
  };
}
