import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
} from "@/lib/api/utils";
import { uuidSchema } from "@/lib/validations";
import { validateParams } from "@/lib/validation-utils";

const MIN_SIMILARITY = 0.99;
const MAX_SIMILARITY = 1.0;
const MIN_MATCH_COUNT = 10;
const MAX_CONNECTIONS = 5;

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
    const idValidation = validateParams(uuidSchema, id, "note ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: currentNote, error: noteError } = await supabase
      .from("notes")
      .select("embedding, content")
      .eq("id", idValidation.data)
      .eq("user_id", user.id)
      .single();

    if (noteError || !currentNote) {
      return errorResponse("Note not found", 404);
    }

    const { data: notes, error: notesError } = await supabase.rpc(
      "search_notes",
      {
        query_embedding: currentNote.embedding as string,
        match_threshold: MIN_SIMILARITY,
        match_count: MIN_MATCH_COUNT,
      }
    );

    if (notesError) {
      throw notesError;
    }

    const { data: exactMatches } = await supabase
      .from("notes")
      .select("id, content, label, category, created_at")
      .eq("user_id", user.id)
      .eq("embedding", currentNote.embedding as string)
      .neq("id", idValidation.data);

    const exactMatchConnections = (exactMatches || []).map((note) => ({
      id: note.id,
      content: note.content,
      label: note.label,
      category: note.category,
      created_at: note.created_at,
      similarity: MAX_SIMILARITY,
    }));

    const similarityConnections = notes
      .filter((note) => {
        if (note.id === idValidation.data) {
          return false;
        }
        if (note.similarity > MAX_SIMILARITY) {
          return false;
        }
        return true;
      })
      .map((note) => ({
        id: note.id,
        content: note.content,
        label: note.label,
        category: note.category,
        created_at: note.created_at,
        similarity: note.similarity,
      }));

    const connectionMap = new Map<string, (typeof exactMatchConnections)[0]>();

    for (const connection of [
      ...exactMatchConnections,
      ...similarityConnections,
    ]) {
      const existing = connectionMap.get(connection.id);
      if (!existing || connection.similarity > existing.similarity) {
        connectionMap.set(connection.id, connection);
      }
    }

    const allConnections = Array.from(connectionMap.values())
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, MAX_CONNECTIONS);

    return successResponse({ connections: allConnections });
  } catch (error) {
    console.error("Error fetching note connections:", error);
    return errorResponse("Internal server error");
  }
}
