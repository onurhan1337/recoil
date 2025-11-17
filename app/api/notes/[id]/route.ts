import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
  calculateNoteCost,
  isInsufficientCreditsError,
} from "@/lib/api/utils";
import { uuidSchema, noteUpdateSchema } from "@/lib/validations";
import { validateParams, validateRequest } from "@/lib/validation-utils";

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
    const idValidation = validateParams(uuidSchema, id, "note ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: note, error: fetchError } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", idValidation.data)
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
      .eq("id", idValidation.data);

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
    const idValidation = validateParams(uuidSchema, id, "note ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const body = await request.json();

    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("user_id, content, pinned")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !existingNote) {
      return errorResponse("Note not found", 404);
    }

    if (existingNote.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const booleanFields = ["pinned", "favorite", "archived"] as const;
    const updateData: Record<string, unknown> = {};

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        updateData[field] = Boolean(body[field]);
      }
    }

    if (Object.keys(updateData).length > 0) {
      if (updateData.pinned === true && !existingNote.pinned) {
        const { count: pinnedCount } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("pinned", true);

        if (pinnedCount !== null && pinnedCount >= 3) {
          return errorResponse("Maximum of 3 pinned notes allowed", 400);
        }
      }

      const { data: updatedNote, error: updateError } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", idValidation.data)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return successResponse({
        note: updatedNote,
      });
    }

    const validation = validateRequest(noteUpdateSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { content, title, tags } = validation.data;

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const costCalculation = calculateNoteCost(content, userPlan);
    const updateCost = costCalculation.totalCost;

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: updateCost,
      }
    );

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);

      if (isInsufficientCreditsError(creditError)) {
        return errorResponse(
          `Insufficient credits. Required: ${updateCost}, Available: ${
            creditError.message.match(/Available: (\d+)/)?.[1] || "unknown"
          }`,
          403
        );
      }

      if (creditError.message?.includes("not found")) {
        return errorResponse("User usage record not found", 404);
      }

      return errorResponse("Failed to process credits", 500);
    }

    const [embedding, metadata] = await Promise.all([
      generateEmbedding(content),
      generateNoteMetadata(content),
    ]);

    const contentUpdateData: Record<string, unknown> = {
      content,
      title: title || null,
      embedding: `[${embedding.join(",")}]`, // pgvector format
      label: metadata.label,
      category: metadata.category,
      tags: tags && tags.length > 0 ? tags : null,
    };

    const { data: updatedNote, error: updateError } = await supabase
      .from("notes")
      .update(contentUpdateData)
      .eq("id", idValidation.data)
      .select()
      .single();

    if (updateError) {
      // Refund credits if update fails
      await supabase
        .from("usage")
        .update({ credits: remainingCredits + updateCost })
        .eq("user_id", user.id);
      throw updateError;
    }

    return successResponse({
      note: updatedNote,
      credits_remaining: remainingCredits,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return errorResponse("Internal server error");
  }
}
