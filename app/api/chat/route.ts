import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { config } from "@/lib/config";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, conversation_id }: {
      messages: any[];
      conversation_id?: string
    } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let conversationId = conversation_id;

    if (!conversationId) {
      const lastUserMessage = messages.findLast((m: any) => m.role === "user");
      const firstMessageText = lastUserMessage?.parts.find((p: any) => p.type === "text")?.text || "New Conversation";
      const title = firstMessageText.slice(0, 50) + (firstMessageText.length > 50 ? "..." : "");

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
    const query = lastMessage.parts.find((p: any) => p.type === "text")?.text || "";

    const { data: usage, error: usageError } = await supabase
      .from("usage")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const chatCost = config.credits.costs.chatMessage;

    if (usageError || !usage || usage.credits < chatCost) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          required: chatCost,
          available: usage?.credits || 0,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const queryEmbedding = await generateEmbedding(query);

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
    }

    console.log("\n=== SEARCH DEBUG ===");
    console.log("Query:", query);
    console.log("Search results count:", results?.length || 0);
    console.log("Match threshold:", config.search.matchThreshold);
    if (results && results.length > 0) {
      console.log("All results:", results.map((r: any) => ({
        content: r.content.substring(0, 150) + "...",
        similarity: (r.similarity * 100).toFixed(1) + "%"
      })));
    } else {
      console.log("NO RESULTS FOUND - This is the problem!");
    }
    console.log("===================\n");

    await supabase
      .from("usage")
      .update({ credits: usage.credits - chatCost })
      .eq("user_id", user.id);

    const notesContext =
      results && results.length > 0
        ? results
            .map(
              (note: any, idx: number) =>
                `[Note ${idx + 1}] ID: ${note.id} | Similarity: ${(note.similarity * 100).toFixed(1)}%\nContent:\n${note.content}`
            )
            .join("\n\n---\n\n")
        : "No relevant notes found in the collection.";

    const modelMessages = convertToModelMessages(messages.slice(0, -1));
    const result = streamText({
      model: google(config.ai.model),
      temperature: config.ai.temperature,
      system: `You are a helpful AI assistant that helps users find and recall information from their personal notes.

RESPONSE FORMAT:
- Use markdown formatting (bold, italic, lists, etc.)
- For each matching note, include: [NOTE:id:similarity:content]
- Be conversational and helpful

CRITICAL INSTRUCTIONS:
1. ALWAYS check if notes are provided in the search results section below
2. If ANY notes are provided (even with low similarity >10%), you MUST reference them
3. When you find relevant notes, include them using the [NOTE:id:similarity:content] format
4. After listing notes, provide a brief summary or answer the user's question
5. Be direct - if notes match the query, say "I found your notes about..."

EXAMPLE RESPONSE:
I found your reading list! Here are the books:

[NOTE:123:0.95:reading list\n\n* Süreyya Ciliv - fırat demirel\n* Elon Musk - walter isaacson\n* Steve Jobs - walter isaacson]

You have several biographies by Walter Isaacson on your list, along with a book about Süreyya Ciliv.

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
        "X-Credits-Remaining": String(usage.credits - chatCost),
        "X-Conversation-Id": conversationId || "",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
