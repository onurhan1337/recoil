import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
} from "@/lib/api/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (getUserPlan(usage?.plan) !== "pro") {
      return errorResponse("Pro plan required for note connections", 403);
    }

    const { id } = await params;

    const { data: currentNote, error: noteError } = await supabase
      .from("notes")
      .select("embedding")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (noteError || !currentNote) {
      return errorResponse("Note not found", 404);
    }

    const { data: notes, error: notesError } = await supabase.rpc(
      "search_notes",
      {
        query_embedding: currentNote.embedding as string,
        match_threshold: 0.7,
        match_count: 6,
      }
    );

    if (notesError) {
      throw notesError;
    }

    const connections = notes
      .filter((note) => note.id !== id)
      .slice(0, 5)
      .map((note) => ({
        id: note.id,
        content: note.content,
        label: note.label,
        category: note.category,
        created_at: note.created_at,
        similarity: note.similarity,
      }));

    return successResponse({ connections });
  } catch (error) {
    console.error("Error fetching note connections:", error);
    return errorResponse("Internal server error");
  }
}
