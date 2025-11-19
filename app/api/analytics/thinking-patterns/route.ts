import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { config } from "@/lib/config";
import { getAIModel } from "@/lib/ai/provider";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import { authenticateUser, errorResponse, successResponse, isProPlan } from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (!isProPlan(usage?.plan)) {
      return errorResponse("This feature requires a Pro subscription", 403);
    }

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const { data: recentNotes, error } = await supabase
      .from("notes")
      .select("content, category, label, created_at")
      .eq("user_id", user.id)
      .gte("created_at", tenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!recentNotes || recentNotes.length === 0) {
      return successResponse({
        insights: "Not enough notes from the last 10 days to analyze thinking patterns.",
        noteCount: 0,
      });
    }

    const notesContext = recentNotes
      .map((note) => {
        const date = new Date(note.created_at).toLocaleDateString();
        return `[${date}] ${note.category || "Note"}${note.label ? `: ${note.label}` : ""}\n${note.content.slice(0, 200)}${note.content.length > 200 ? "..." : ""}`;
      })
      .join("\n\n---\n\n");

    const { model } = getAIModel({
      model: config.ai.model,
      provider: config.ai.provider,
      fallbackEnabled: config.ai.fallbackEnabled,
      ollamaModel: config.ai.ollama.model,
    });

    const result = await generateText({
      model,
      temperature: 0.3,
      prompt: AI_PROMPTS.thinkingPatterns.analyze(notesContext),
    });

    const { error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        insights: result.text,
        note_count: recentNotes.length,
        start_date: tenDaysAgo.toISOString(),
        end_date: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error saving analysis:", insertError);
    }

    return successResponse({
      insights: result.text,
      noteCount: recentNotes.length,
    });
  } catch (error) {
    console.error("Error analyzing thinking patterns:", error);
    return errorResponse("Internal server error");
  }
}
