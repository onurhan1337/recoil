import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateNoteMetadata } from "@/lib/ai";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
  calculateNoteCost,
} from "@/lib/api/utils";
import { uuidSchema } from "@/lib/validations";
import { validateParams } from "@/lib/validation-utils";

export async function POST(
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

    const { data: sourceNote, error: fetchError } = await supabase
      .from("notes")
      .select("content, label, tags, category, embedding")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !sourceNote) {
      return errorResponse("Note not found", 404);
    }

    const { data: checkNote } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (checkNote?.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("credits, plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const costCalculation = calculateNoteCost(sourceNote.content, userPlan);
    const noteCost = costCalculation.totalCost;

    if (!usage || usage.credits < noteCost) {
      return errorResponse("Insufficient credits", 403);
    }

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: noteCost,
      }
    );

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);
      return errorResponse("Failed to process credits", 500);
    }

    const metadata = await generateNoteMetadata(sourceNote.content);

    const { data: duplicatedNote, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        content: sourceNote.content,
        embedding: sourceNote.embedding,
        label: sourceNote.label || metadata.label,
        category: sourceNote.category || metadata.category,
        tags:
          sourceNote.tags && sourceNote.tags.length > 0
            ? sourceNote.tags
            : null,
      })
      .select()
      .single();

    if (noteError) {
      await supabase
        .from("usage")
        .update({ credits: remainingCredits + noteCost })
        .eq("user_id", user.id);
      throw noteError;
    }

    return successResponse({
      note: duplicatedNote,
      credits_remaining: remainingCredits,
    });
  } catch (error) {
    console.error("Error duplicating note:", error);
    return errorResponse("Internal server error");
  }
}
