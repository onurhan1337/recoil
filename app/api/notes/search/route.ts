import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { searchSchema } from "@/lib/validations";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { validateRequest } from "@/lib/validation-utils";
import { handleCreditError } from "@/lib/api/utils";

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

      if (handleCreditError(creditError)) {
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        results,
        credits_remaining: remainingCredits,
      });
    }

    const notesContext = results
      .map(
        (note: any, idx: number) =>
          `${idx + 1}. ${note.content} (similarity: ${note.similarity.toFixed(
            2
          )})`
      )
      .join("\n\n");

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes and analyzes notes based on semantic search results. Be concise and relevant.",
        },
        {
          role: "user",
          content: `Based on the search query "${query}", here are the most relevant notes:\n\n${notesContext}\n\nPlease provide a brief summary and highlight the key insights.`,
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
