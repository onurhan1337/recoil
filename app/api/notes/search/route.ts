import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { searchSchema } from "@/lib/validations";
import { streamText } from "ai";
import { validateRequest } from "@/lib/validation-utils";
import { isInsufficientCreditsError } from "@/lib/api/utils";
import { getAIModel } from "@/lib/ai/provider";
import { config } from "@/lib/config";
import { AI_PROMPTS } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(searchSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { query } = validation.data;

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: 1,
      }
    );

    if (creditError) {
      console.error("Failed to decrement credits:", creditError);

      if (isInsufficientCreditsError(creditError)) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 403 }
        );
      }

      if (creditError.message?.includes("not found")) {
        return NextResponse.json(
          { error: "User usage record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to process credits" },
        { status: 500 }
      );
    }

    const queryEmbedding = await generateEmbedding(query);

    const { data: results, error: searchError } = await supabase.rpc(
      "search_notes",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.5,
        match_count: 10,
      }
    );

    if (searchError) {
      console.error("Search error:", searchError);
      await supabase
        .from("usage")
        .update({ credits: remainingCredits + 1 })
        .eq("user_id", user.id);
      return NextResponse.json(
        { error: "Search failed", details: searchError.message },
        { status: 500 }
      );
    }

    const notesContext = results
      .map(
        (note: any, idx: number) =>
          `${idx + 1}. ${note.content} (similarity: ${note.similarity.toFixed(
            2
          )})`
      )
      .join("\n\n");

    const { model } = getAIModel({
      model: config.ai.model,
      provider: config.ai.provider,
      fallbackEnabled: config.ai.fallbackEnabled,
      ollamaModel: config.ai.ollama.model,
    });

    const result = streamText({
      model,
      messages: [
        {
          role: "system",
          content: AI_PROMPTS.noteSearch.system(),
        },
        {
          role: "user",
          content: AI_PROMPTS.noteSearch.userMessage(query, notesContext),
        },
      ],
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Credits-Remaining": String(remainingCredits),
        "X-Results-Count": String(results.length),
      },
    });
  } catch (error) {
    console.error("Error searching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
