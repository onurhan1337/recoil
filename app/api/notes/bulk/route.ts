import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import { bulkCreateNotesSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
  calculateNoteCost,
  isInsufficientCreditsError,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import { Note } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(bulkCreateNotesSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { notes: noteInputs } = validation.data;

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (!usage) {
      return errorResponse("User usage data not found", 404);
    }

    const userPlan = getUserPlan(usage.plan);

    const totalCost = noteInputs.reduce((sum, note) => {
      const costCalc = calculateNoteCost(note.content, userPlan);
      return sum + costCalc.totalCost;
    }, 0);

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: totalCost,
      }
    );

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);

      if (isInsufficientCreditsError(creditError)) {
        const message =
          typeof creditError.message === "string" ? creditError.message : "";
        const availableMatch = message.match(/Available: (\d+)/);
        const available = availableMatch ? availableMatch[1] : "unknown";
        return errorResponse(
          `Insufficient credits. Required: ${totalCost}, Available: ${available}`,
          403
        );
      }

      if (creditError.message?.includes("not found")) {
        return errorResponse("User usage record not found", 404);
      }

      return errorResponse("Failed to process credits", 500);
    }

    const createdNotes: Note[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < noteInputs.length; i++) {
      const noteInput = noteInputs[i];

      try {
        const [embedding, metadata] = await Promise.all([
          generateEmbedding(noteInput.content),
          generateNoteMetadata(noteInput.content),
        ]);

        const { data: note, error: noteError } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            content: noteInput.content,
            title: noteInput.title || null,
            embedding: embedding ? `[${embedding.join(",")}]` : null,
            label: metadata.label,
            category: metadata.category,
            tags:
              noteInput.tags && noteInput.tags.length > 0
                ? noteInput.tags
                : null,
          })
          .select()
          .single();

        if (noteError) {
          console.error(`Failed to create note ${i + 1}:`, noteError);
          errors.push({
            index: i,
            error: noteError.message || "Failed to create note",
          });
        } else if (note) {
          createdNotes.push(note);
        }
      } catch (error) {
        console.error(`Error processing note ${i + 1}:`, error);
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (createdNotes.length === 0) {
      await supabase
        .from("usage")
        .update({ credits: remainingCredits + totalCost })
        .eq("user_id", user.id);

      return errorResponse("Failed to create any notes", 500);
    }

    const refundAmount =
      errors.length > 0
        ? errors.reduce((sum, _, index) => {
            const noteInput = noteInputs[index];
            const costCalc = calculateNoteCost(noteInput.content, userPlan);
            return sum + costCalc.totalCost;
          }, 0)
        : 0;

    let finalCredits = remainingCredits;
    if (refundAmount > 0) {
      const { data: updatedCredits } = await supabase
        .from("usage")
        .update({ credits: remainingCredits + refundAmount })
        .eq("user_id", user.id)
        .select("credits")
        .single();

      finalCredits = updatedCredits?.credits ?? remainingCredits;
    }

    return successResponse({
      success: true,
      notes: createdNotes,
      successCount: createdNotes.length,
      failedCount: errors.length,
      totalCost: totalCost - refundAmount,
      creditsRemaining: finalCredits,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in bulk note creation:", error);
    return errorResponse("Internal server error");
  }
}
