import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse } from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const debugToken = process.env.DEBUG_TOKEN!;
    const authHeader = request.headers.get("authorization");

    if (!debugToken || authHeader !== `Bearer ${debugToken}`) {
      return errorResponse("Unauthorized", 401);
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("id, content, embedding, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (notesError) {
      return errorResponse(notesError.message, 500);
    }

    return successResponse({
      user_id: user.id,
      notes_count: notes?.length || 0,
      notes: notes?.map((n) => ({
        id: n.id,
        content: n.content.substring(0, 200),
        has_embedding: !!n.embedding,
        embedding_length: n.embedding ? n.embedding.length : 0,
        created_at: n.created_at,
      })),
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return errorResponse("Internal server error", 500);
  }
}
