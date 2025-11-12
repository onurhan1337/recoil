import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import { markdownImportSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
  calculateNoteCost,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import { parseMarkdownToNotes, validateMarkdownSize } from "@/lib/markdown-parser";
import { Note } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(markdownImportSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { markdown } = validation.data;

    const sizeValidation = validateMarkdownSize(markdown);
    if (!sizeValidation.isValid) {
      return errorResponse(sizeValidation.error || "Invalid markdown", 400);
    }

    const noteInputs = parseMarkdownToNotes(markdown);

    if (noteInputs.length === 0) {
      return errorResponse("No valid notes found in markdown", 400);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("credits, plan")
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

    if (usage.credits < totalCost) {
      return errorResponse(
        `Insufficient credits. Required: ${totalCost}, Available: ${usage.credits}`,
        403
      );
    }

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: totalCost,
      }
    );

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);
      return errorResponse("Failed to process credits", 500);
    }

    const createdNotes: Note[] = [];

    for (const noteInput of noteInputs) {
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
            tags: noteInput.tags && noteInput.tags.length > 0 ? noteInput.tags : null,
          })
          .select()
          .single();

        if (noteError) {
          console.error("Failed to create note:", noteError);
        } else if (note) {
          createdNotes.push(note);
        }
      } catch (error) {
        console.error("Error processing note:", error);
      }
    }

    if (createdNotes.length === 0) {
      await supabase
        .from("usage")
        .update({ credits: remainingCredits + totalCost })
        .eq("user_id", user.id);

      return errorResponse("Failed to create any notes from markdown", 500);
    }

    return successResponse({
      success: true,
      notes: createdNotes,
      creditsRemaining: remainingCredits,
      totalCost,
    });
  } catch (error) {
    console.error("Error importing markdown:", error);
    return errorResponse("Internal server error");
  }
}
