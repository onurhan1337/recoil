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
      return errorResponse("Pro plan required for Canvas feature", 403);
    }

    const body = await request.json();
    const { sourceNoteId, targetNoteId } = body;

    if (!sourceNoteId || !targetNoteId) {
      return errorResponse("Source and target note IDs are required", 400);
    }

    if (sourceNoteId === targetNoteId) {
      return errorResponse("Cannot link a note to itself", 400);
    }

    const { data: sourceNote } = await supabase
      .from("notes")
      .select("id")
      .eq("id", sourceNoteId)
      .eq("user_id", user.id)
      .single();

    const { data: targetNote } = await supabase
      .from("notes")
      .select("id")
      .eq("id", targetNoteId)
      .eq("user_id", user.id)
      .single();

    if (!sourceNote || !targetNote) {
      return errorResponse("One or both notes not found", 404);
    }

    const { data: existingLink } = await supabase
      .from("note_links")
      .select("id")
      .eq("user_id", user.id)
      .eq("source_note_id", sourceNoteId)
      .eq("target_note_id", targetNoteId)
      .eq("link_type", "manual")
      .maybeSingle();

    if (existingLink) {
      return errorResponse("Link already exists", 409);
    }

    const { data: link, error: linkError } = await supabase
      .from("note_links")
      .insert({
        user_id: user.id,
        source_note_id: sourceNoteId,
        target_note_id: targetNoteId,
        link_type: "manual",
      })
      .select("id, source_note_id, target_note_id, link_type, created_at")
      .single();

    if (linkError) {
      console.error("Error creating link:", linkError);
      return errorResponse("Failed to create link", 500);
    }

    return successResponse({
      link: {
        id: link.id,
        source_note_id: link.source_note_id,
        target_note_id: link.target_note_id,
        link_type: link.link_type,
        created_at: link.created_at,
      },
    });
  } catch (error) {
    console.error("Error in create link API:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest) {
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
      return errorResponse("Pro plan required for Canvas feature", 403);
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return errorResponse("Link ID is required", 400);
    }

    const { error: deleteError } = await supabase
      .from("note_links")
      .delete()
      .eq("id", linkId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting link:", deleteError);
      return errorResponse("Failed to delete link", 500);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Error in delete link API:", error);
    return errorResponse("Internal server error", 500);
  }
}
