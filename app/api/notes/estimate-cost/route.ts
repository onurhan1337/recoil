import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  isProPlan,
} from "@/lib/api/utils";

type UserPlan = "free" | "pro";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return errorResponse("Content is required", 400);
    }

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (usageError) {
      throw usageError;
    }

    const userPlan = isProPlan(usage?.plan ?? "free")
      ? ("pro" as UserPlan)
      : ("free" as UserPlan);
    const baseCost = config.plans[userPlan].costs.createNote;

    const contentLength = content.length;
    const chunkSize = config.embeddings.chunkSize;
    const estimatedChunks = Math.ceil(contentLength / chunkSize);

    const embeddingCostPerChunk = config.plans[userPlan].costs.embedding;
    const additionalEmbeddingCost = Math.max(
      0,
      (estimatedChunks - 1) * embeddingCostPerChunk
    );

    const totalCost = baseCost + additionalEmbeddingCost;

    return successResponse({
      estimated_cost: totalCost,
      base_cost: baseCost,
      embedding_cost: additionalEmbeddingCost,
      content_length: contentLength,
      estimated_chunks: estimatedChunks,
    });
  } catch (error) {
    console.error("Error estimating cost:", error);
    return errorResponse("Internal server error");
  }
}
