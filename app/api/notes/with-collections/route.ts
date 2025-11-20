import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";
import type { Note, Collection } from "@/lib/api/types";

interface NoteWithCollections extends Note {
  collections: Collection[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("favorite", { ascending: false })
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (notesError) {
      throw notesError;
    }

    const { data: noteCollections, error: collectionsError } = await supabase
      .from("note_collections")
      .select("note_id, collection_id, collections(*)")
      .in(
        "note_id",
        notes.map((n) => n.id)
      );

    if (collectionsError) {
      throw collectionsError;
    }

    const notesWithCollections: NoteWithCollections[] = notes.map((note) => ({
      ...note,
      canvas_position: (note.canvas_position as { x: number; y: number } | null) || undefined,
      collections:
        noteCollections
          ?.filter((nc) => nc.note_id === note.id)
          .map((nc) => nc.collections as unknown as Collection)
          .filter(Boolean) || [],
    }));

    return successResponse({ notes: notesWithCollections });
  } catch (error) {
    console.error("Error fetching notes with collections:", error);
    return errorResponse("Internal server error");
  }
}
