import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { config } from "@/lib/config";
import type { SearchNoteResult } from "@/lib/api/types";
import { isTimeBasedQuery, getDateRange } from "@/lib/utils/query-helpers";
import {
  authenticateUser,
  errorResponse,
  getUserPlan,
  isInsufficientCreditsError,
} from "@/lib/api/utils";
import { chatRequestSchema } from "@/lib/validations";
import { validateRequest } from "@/lib/validation-utils";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(chatRequestSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { messages, conversation_id } = validation.data;

    let conversationId = conversation_id;

    if (!conversationId) {
      const lastUserMessage = messages.findLast((m) => m.role === "user");
      const firstMessageText =
        lastUserMessage?.parts.find((p) => p.type === "text")?.text ||
        "New Conversation";
      const title =
        firstMessageText.slice(0, 50) +
        (firstMessageText.length > 50 ? "..." : "");

      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error("Failed to create conversation:", convError);
      } else {
        conversationId = newConversation.id;
      }
    }

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.parts.find((p) => p.type === "text")?.text || "";

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (usageError || !usage) {
      return errorResponse("User usage record not found", 404);
    }

    const userPlan = getUserPlan(usage.plan);
    const chatCost = config.plans[userPlan].costs.chatMessage;

    const { data: remainingCredits, error: creditError } = await supabase.rpc(
      "decrement_credits",
      {
        user_id: user.id,
        amount: chatCost,
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
          `Insufficient credits. Required: ${chatCost}, Available: ${available}`,
          403
        );
      }

      if (creditError.message?.includes("not found")) {
        return errorResponse("User usage record not found", 404);
      }

      return errorResponse("Failed to process credits", 500);
    }

    let filteredResults: SearchNoteResult[] = [];

    if (isTimeBasedQuery(query)) {
      const dateRange = getDateRange(query);
      if (dateRange) {
        const queryBuilder = supabase
          .from("notes")
          .select("id, content, category, label")
          .eq("user_id", user.id)
          .gte("created_at", dateRange.start.toISOString())
          .order("created_at", { ascending: false })
          .limit(config.search.matchCount);

        const { data: notes } = dateRange.end
          ? await queryBuilder.lte("created_at", dateRange.end.toISOString())
          : await queryBuilder;

        if (notes) {
          filteredResults = notes.map((note) => ({
            id: note.id,
            content: note.content,
            category: note.category || null,
            label: note.label || null,
            similarity: 1.0,
          }));
        }
      }
    } else {
      const queryEmbedding = await generateEmbedding(query);

      const { data: results, error: searchError } = await supabase.rpc(
        "search_notes",
        {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: config.search.matchThreshold,
          match_count: config.search.matchCount,
        }
      );

      if (searchError) {
        console.error("Search error:", searchError);
      }

      const displayThreshold = 0.45;
      filteredResults =
        (results as SearchNoteResult[] | null)?.filter(
          (note) => note.similarity >= displayThreshold
        ) || [];

      if (filteredResults.length === 0) {
        const { data: recentNotes } = await supabase
          .from("notes")
          .select("id, content, category, label")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentNotes && recentNotes.length > 0) {
          filteredResults = recentNotes.map((note) => ({
            id: note.id,
            content: note.content,
            category: note.category || null,
            label: note.label || null,
            similarity: 0.3,
          }));
        }
      }
    }

    const notesContext =
      filteredResults.length > 0
        ? filteredResults
            .map((note) => {
              const category = note.category || "Note";
              const label = note.label || "";
              return `[${category}${label ? `: ${label}` : ""}] ID: ${
                note.id
              } | Similarity: ${(note.similarity * 100).toFixed(
                1
              )}%\nContent:\n${note.content}`;
            })
            .join("\n\n---\n\n")
        : "No relevant notes found in the collection.";

    const notesJsonForAI =
      filteredResults.length > 0
        ? JSON.stringify(
            filteredResults.map((note) => ({
              id: note.id,
              category: note.category || "Note",
              label: note.label || "",
              content: note.content,
              similarity: note.similarity,
            }))
          )
        : "[]";

    const modelMessages = convertToModelMessages(
      messages.slice(0, -1) as Parameters<typeof convertToModelMessages>[0]
    );
    const result = streamText({
      model: google(config.ai.model),
      temperature: config.ai.temperature,
      system: `You are a helpful AI assistant that helps users find and recall information from their personal notes.

USER PLAN: ${userPlan.toUpperCase()}
${
  userPlan === "pro"
    ? "- This user has PRO access with advanced analytics and insights capabilities\n- You can provide deeper analysis, thinking patterns, connections between notes, and personalized insights\n- Proactively offer to analyze their notes for patterns, trends, or connections when relevant"
    : "- This user is on the FREE plan\n- You can ONLY help them find and recall specific notes\n- DO NOT provide analysis, insights, patterns, trends, or connections between notes\n- If they ask for analysis/insights/patterns, politely say: 'I can help you find specific notes, but analysis and insights are available with the Pro plan. Would you like to search for something specific instead?'"
}

RESPONSE FORMAT:
- Use markdown formatting (bold, italic, lists, etc.)
- When referencing notes, use this EXACT format: [NOTE_REF:note_id]
- Be conversational and helpful
- The note cards will be displayed automatically by the UI, you just need to mention which notes are relevant
- At the very END of your response, you MUST include a hidden metadata block in this format:
  <!--NOTES_METADATA:${notesJsonForAI}-->

CRITICAL INSTRUCTIONS:
1. ALWAYS check if notes are provided in the search results section below
2. Notes may come from semantic search (similarity >=55%) or time-based queries (summaries, this week, etc.)
3. If ANY notes are provided, you MUST include [NOTE_REF:note_id] markers
4. Include the note reference marker where you want the note card to appear in your response
5. After the note markers, provide a brief summary or answer based on the note contents
6. Be direct - if notes match the query, say "I found X relevant notes:" or "Here are your notes from [time period]:"
7. ALWAYS include the <!--NOTES_METADATA:--> block at the end (even if empty array)
${
  userPlan === "pro"
    ? "8. For PRO users: Offer insights about patterns, connections between notes, thinking trends, or suggest related areas to explore based on their notes"
    : "8. For FREE users: NEVER analyze, summarize across multiple notes, identify patterns, or provide insights. Only show matching notes and basic info about what's in them. Redirect analysis requests to Pro upgrade."
}

EXAMPLE RESPONSE:
I found your reading list! Here's what I found:

[NOTE_REF:123e4567-e89b-12d3-a456-426614174000]

You have several biographies by Walter Isaacson on your list, including books about Elon Musk and Steve Jobs.
${
  userPlan === "pro"
    ? "\n\n**Pro Insight:** I notice you're interested in tech innovators. You might want to explore connections between these figures and their impact on modern technology."
    : ""
}

<!--NOTES_METADATA:${notesJsonForAI}-->

Only say "no notes found" if the search results section explicitly says "No relevant notes found".`,
      messages: [
        ...modelMessages,
        {
          role: "user" as const,
          content: `User query: "${query}"\n\n=== SEARCH RESULTS FROM USER'S NOTES ===\n\n${notesContext}\n\n=== END OF SEARCH RESULTS ===\n\nBased on these search results, please help the user with their query.`,
        },
      ],
      async onFinish({ text }) {
        if (conversationId) {
          const supabase = await createClient();

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "user",
            content: query,
          });

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: text,
          });

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Credits-Remaining": String(remainingCredits),
        "X-Conversation-Id": conversationId || "",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return errorResponse("Internal server error", 500);
  }
}
