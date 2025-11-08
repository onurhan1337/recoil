import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";
import { noteSchema } from "@/lib/validations";
import { config } from "@/lib/config";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
} from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = noteSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Invalid request", 400);
    }

    const { content, tags } = validation.data;

    const { data: usage } = await supabase
      .from("usage")
      .select("credits, plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);
    const noteCost = config.plans[userPlan].costs.createNote;

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
        embedding: JSON.stringify(embedding),
        label: metadata.label,
        category: metadata.category,
        tags: tags?.length ? tags : null,
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: notes, error } = await supabase
      .from("notes")
      .select("id, content, label, category, tags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return successResponse({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return errorResponse("Internal server error");
  }
}
