import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import { noteSchema, paginationSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
  calculateNoteCost,
} from "@/lib/api/utils";
import { validateRequest, validateQuery } from "@/lib/validation-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(noteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { content, title, tags } = validation.data;

    const { data: usage } = await supabase
      .from("usage")
      .select("credits, plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const costCalculation = calculateNoteCost(content, userPlan);
    const noteCost = costCalculation.totalCost;

    if (!usage || usage.credits < noteCost) {
      return errorResponse("Insufficient credits", 403);
    }

    const [embedding, metadata] = await Promise.all([
      generateEmbedding(content),
      generateNoteMetadata(content),
    ]);

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        content,
        title: title || null,
        embedding: JSON.stringify(embedding),
        label: metadata.label,
        category: metadata.category,
        tags: tags.length > 0 ? tags : null,
      })
      .select()
      .single();

    if (noteError) {
      throw noteError;
    }

    const { error: creditError } = await supabase
      .from("usage")
      .update({ credits: usage.credits - noteCost })
      .eq("user_id", user.id);

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);
    }

    return successResponse({
      note,
      credits_remaining: usage.credits - noteCost,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return errorResponse("Internal server error");
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const validation = validateQuery(paginationSchema, {
      limit: limitParam,
      offset: offsetParam,
    });

    if (!validation.success) {
      return validation.response;
    }

    const { limit, offset } = validation.data;

    const [notesResult, countResult] = await Promise.all([
      supabase
        .from("notes")
        .select(
          "id, content, title, label, category, tags, created_at, pinned, favorite, archived"
        )
        .eq("user_id", user.id)
        .order("favorite", { ascending: false })
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    if (notesResult.error) {
      throw notesResult.error;
    }

    return successResponse({
      notes: notesResult.data,
      total: countResult.count || 0,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return errorResponse("Internal server error");
  }
}
