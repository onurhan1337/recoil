import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import { config } from "@/lib/config";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
} from "@/lib/api/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const { data: note, error: fetchError } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !note) {
      return errorResponse("Note not found", 404);
    }

    if (note.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return successResponse({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return errorResponse("Internal server error");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { content, tags } = body;

    if (!content || typeof content !== "string") {
      return errorResponse("Content is required", 400);
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return errorResponse("Tags must be an array", 400);
    }

    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("user_id, content")
      .eq("id", id)
      .single();

    if (fetchError || !existingNote) {
      return errorResponse("Note not found", 404);
    }

    if (existingNote.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("credits, plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const updateCost = config.plans[userPlan].costs.createNote;

    if (!usage || usage.credits < updateCost) {
      return errorResponse("Insufficient credits", 403);
    }

    const [embedding, metadata] = await Promise.all([
      generateEmbedding(content),
      generateNoteMetadata(content),
    ]);

    const updateData: Record<string, unknown> = {
      content,
      embedding: JSON.stringify(embedding),
      label: metadata.label,
      category: metadata.category,
      ...(tags !== undefined && { tags: tags.length > 0 ? tags : null }),
    };

    const { data: updatedNote, error: updateError } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const { error: creditError } = await supabase
      .from("usage")
      .update({ credits: usage.credits - updateCost })
      .eq("user_id", user.id);

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);
    }

    return successResponse({
      note: updatedNote,
      credits_remaining: usage.credits - updateCost,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return errorResponse("Internal server error");
  }
}
