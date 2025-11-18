import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { config } from "@/lib/config";
import { getAIModel } from "@/lib/ai/provider";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import type { SearchNoteResult } from "@/lib/api/types";
import { isTimeBasedQuery, getDateRange } from "@/lib/utils/query-helpers";
import {
  authenticateUser,
  errorResponse,
  getUserPlan,
  isInsufficientCreditsError,
  isUserNotFoundError,
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

    const normalizedBody = {
      ...body,
      messages: body.messages?.map((msg: any) => {
        if (msg.content && !msg.parts) {
          return {
            role: msg.role,
            parts: [{ type: "text", text: msg.content }],
          };
        }
        return msg;
      }),
    };

    const validation = validateRequest(chatRequestSchema, normalizedBody);

    if (!validation.success) {
      console.error("[Chat API] Validation failed:", validation.response);
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

      if (isUserNotFoundError(creditError)) {
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
            .map((note, index) => {
              const category = note.category || "Note";
              const label = note.label || "";
              return `Note ${index + 1} [${category}${
                label ? `: ${label}` : ""
              }]:\n${note.content}\n(Reference ID: ${note.id})`;
            })
            .join("\n\n---\n\n")
        : "No relevant notes found in the collection.";

    const { model } = getAIModel({
      model: config.ai.model,
      provider: config.ai.provider,
      fallbackEnabled: config.ai.fallbackEnabled,
      ollamaModel: config.ai.ollama.model,
    });

    const modelMessages = convertToModelMessages(
      messages.slice(0, -1) as Parameters<typeof convertToModelMessages>[0]
    );

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model,
          temperature: config.ai.temperature,
          system: AI_PROMPTS.chat.system(userPlan),
          messages: [
            ...modelMessages,
            {
              role: "user" as const,
              content: AI_PROMPTS.chat.userMessage(query, notesContext),
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

            filteredResults.forEach((note) => {
              writer.write({
                type: "data-note",
                id: note.id,
                data: {
                  id: note.id,
                  category: note.category || "Note",
                  label: note.label || "",
                  content: note.content,
                  similarity: note.similarity,
                },
              });
            });
          },
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({
      stream,
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
