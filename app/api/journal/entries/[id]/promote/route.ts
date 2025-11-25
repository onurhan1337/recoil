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

const ASYNC_PROCESSING_THRESHOLD = 5000;

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
    const body = await request.json().catch(() => ({}));
    const { content: updatedContent, title, tags } = body;

    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (entryError || !entry) {
      if (entryError?.code === "PGRST116") {
        return errorResponse("Journal entry not found", 404);
      }
      return errorResponse("Failed to fetch journal entry", 500);
    }

    if (entry.promoted_to_note_id) {
      return errorResponse("This journal entry has already been promoted", 400);
    }

    const noteContent = updatedContent || entry.content;

    if (updatedContent && updatedContent !== entry.content) {
      const wordCount = updatedContent
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      await supabase
        .from("journal_entries")
        .update({
          content: updatedContent,
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const costCalculation = calculateNoteCost(noteContent, userPlan);
    const noteCost = costCalculation.totalCost;

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: noteCost,
      }
    );

    if (creditError) {
      if (isInsufficientCreditsError(creditError)) {
        return errorResponse(
          `Insufficient credits. This promotion costs ${noteCost} credits.`,
          402
        );
      }
      return errorResponse("Failed to process promotion", 500);
    }

    const shouldProcessAsync = noteContent.length > ASYNC_PROCESSING_THRESHOLD;

    let embedding: string | null = null;
    let metadata: { category?: string; label?: string } | null = null;

    if (!shouldProcessAsync) {
      try {
        embedding = (await generateEmbedding(noteContent)).join(",");
        metadata = await generateNoteMetadata(noteContent);
      } catch (error) {
        return errorResponse("Failed to generate embedding/metadata", 500);
      }
    }

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        content: noteContent,
        embedding,
        category: metadata?.category || null,
        label: metadata?.label || null,
        title: title?.trim() || null,
        tags: tags && Array.isArray(tags) && tags.length > 0 ? tags : null,
      })
      .select()
      .single();

    if (noteError) {
      await supabase
        .from("usage")
        .update({ credits: (remainingCredits || 0) + noteCost })
        .eq("user_id", user.id);
      return errorResponse("Failed to create note", 500);
    }

    await supabase
      .from("journal_entries")
      .update({
        promoted_to_note_id: note.id,
      })
      .eq("id", id);

    if (shouldProcessAsync && !embedding) {
      generateEmbedding(noteContent)
        .then((emb: number[]) => {
          return supabase
            .from("notes")
            .update({ embedding: `[${emb.join(",")}]` })
            .eq("id", note.id);
        })
        .catch((err) => {
          return errorResponse(
            "Failed to update embedding asynchronously: " + err.message,
            500
          );
        });

      generateNoteMetadata(noteContent)
        .then((meta) => {
          return supabase
            .from("notes")
            .update({
              category: meta?.category || null,
              label: meta?.label || null,
            })
            .eq("id", note.id);
        })
        .catch((err) => {
          return errorResponse(
            "Failed to update metadata asynchronously: " + err.message,
            500
          );
        });
    }

    return successResponse({
      success: true,
      note,
      creditsRemaining: remainingCredits || 0,
    });
  } catch (error) {
    return errorResponse("Failed to promote journal entry", 500);
  }
}
