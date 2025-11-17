import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { config } from "@/lib/config";
import {
  authenticateUser,
  errorResponse,
  successResponse,
} from "@/lib/api/utils";
import { validateQuery } from "@/lib/validation-utils";
import { searchSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const debugToken = process.env.DEBUG_TOKEN;
    const authHeader = request.headers.get("authorization");

    if (!debugToken || authHeader !== `Bearer ${debugToken}`) {
      return errorResponse("Unauthorized", 401);
    }

    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParam = searchParams.get("q") || "reading list";

    const validation = validateQuery(searchSchema, {
      query: queryParam,
    });

    if (!validation.success) {
      return validation.response;
    }

    const { query } = validation.data;

    const queryEmbedding = await generateEmbedding(query);

    console.log("Query:", query);
    console.log("Embedding length:", queryEmbedding.length);
    console.log("First 10 values:", queryEmbedding.slice(0, 10));

    // Search notes
    const { data: results, error: searchError } = await supabase.rpc(
      "search_notes",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: config.search.matchThreshold,
        match_count: config.search.matchCount,
      }
    );

    if (searchError) {
      console.error("Search error:", searchError);
      return errorResponse(searchError?.message || "Search error", 500);
    }

    return successResponse({
      query,
      threshold: config.search.matchThreshold,
      match_count: config.search.matchCount,
      embedding_length: queryEmbedding.length,
      results_count: results?.length || 0,
      results: results?.map((r: any) => ({
        id: r.id,
        content: r.content.substring(0, 200),
        similarity: r.similarity,
        similarity_percent: (r.similarity * 100).toFixed(2) + "%",
      })),
    });
  } catch (error: any) {
    console.error("Error in search debug:", error);
    return errorResponse("Internal server error", 500);
  }
}
