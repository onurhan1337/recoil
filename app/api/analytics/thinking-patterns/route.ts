import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { config } from "@/lib/config";
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

    const result = await generateText({
      model: google(config.ai.model),
      temperature: 0.3,
      prompt: `You are an AI analyst tasked with analyzing a user's note-taking patterns and providing insights about their thinking patterns, focus areas, and mental state.

Below are notes from the last 10 days:

${notesContext}

Analyze these notes and provide:
1. Main themes or focus areas (2-3 key topics)
2. Thinking patterns (e.g., problem-solving, planning, learning, reflection)
3. A brief insight about their mental state or productivity

Keep your response concise (3-4 sentences max), insightful, and actionable. Use a friendly, encouraging tone.

Response format:
Your main focus has been on [themes]. You're showing [pattern type] thinking with [observation]. [Insight or recommendation].`,
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
