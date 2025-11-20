import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  isProPlan,
} from "@/lib/api/utils";

export async function POST(request: NextRequest) {
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

    if (!isProPlan(usage?.plan)) {
      return errorResponse("Pro plan required for semantic links", 403);
    }

    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("id, content, title, label, embedding")
      .eq("user_id", user.id)
      .not("embedding", "is", null);

    if (notesError) {
      console.error("Error fetching notes:", notesError);
      return errorResponse("Failed to fetch notes", 500);
    }

    if (!notes || notes.length < 2) {
      return successResponse({
        message: "Not enough notes with embeddings to create semantic links",
        linksCreated: 0
      });
    }

    const linksToCreate: Array<{
      user_id: string;
      source_note_id: string;
      target_note_id: string;
      link_type: string;
    }> = [];

    for (let i = 0; i < notes.length; i++) {
      const sourceNote = notes[i];

      if (!sourceNote.embedding) {
        continue;
      }

      const { data: similarNotes, error: similarError } = await supabase.rpc(
        "match_notes",
        {
          query_embedding: sourceNote.embedding,
          match_threshold: 0.7,
          match_count: 5,
          user_id_filter: user.id,
        }
      );

      if (similarError) {
        console.error("Error finding similar notes:", similarError);
        continue;
      }

      if (similarNotes && Array.isArray(similarNotes)) {
        for (const similar of similarNotes) {
          if (similar.id === sourceNote.id) continue;

          const { data: existingLink } = await supabase
            .from("note_links")
            .select("id")
            .eq("user_id", user.id)
            .or(
              `and(source_note_id.eq.${sourceNote.id},target_note_id.eq.${similar.id}),and(source_note_id.eq.${similar.id},target_note_id.eq.${sourceNote.id})`
            )
            .maybeSingle();

          if (!existingLink) {
            linksToCreate.push({
              user_id: user.id,
              source_note_id: sourceNote.id,
              target_note_id: similar.id,
              link_type: "semantic",
            });
          }
        }
      }
    }

    if (linksToCreate.length === 0) {
      return successResponse({
        message: "No new semantic links to create",
        linksCreated: 0
      });
    }

    const { data: createdLinks, error: createError } = await supabase
      .from("note_links")
      .insert(linksToCreate)
      .select();

    if (createError) {
      console.error("Error creating semantic links:", createError);
      return errorResponse("Failed to create semantic links", 500);
    }

    return successResponse({
      message: `Created ${createdLinks?.length || 0} semantic links`,
      linksCreated: createdLinks?.length || 0
    });
  } catch (error) {
    console.error("Error in semantic links API:", error);
    return errorResponse("Internal server error", 500);
  }
}
