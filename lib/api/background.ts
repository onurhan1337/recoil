/**
 * Background processing utilities for async operations
 * This allows expensive operations to run without blocking the main request
 */

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/embeddings";
import { generateNoteMetadata } from "@/lib/ai";

export interface BackgroundJobResult {
  success: boolean;
  error?: string;
}

/**
 * Process AI operations for a note in the background
 * This includes embedding generation and metadata extraction
 */
export async function processNoteAI(
  noteId: string,
  content: string
): Promise<BackgroundJobResult> {
  try {
    const supabase = await createClient();

    const [embedding, metadata] = await Promise.all([
      generateEmbedding(content),
      generateNoteMetadata(content),
    ]);

    const { error } = await supabase
      .from("notes")
      .update({
        embedding: `[${embedding.join(",")}]`,
        label: metadata.label,
        category: metadata.category,
      })
      .eq("id", noteId);

    if (error) {
      console.error(`Failed to update note ${noteId} with AI data:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error processing AI for note ${noteId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Queue a background job by making a non-blocking fetch request
 * Returns immediately without waiting for the job to complete
 */
export async function queueBackgroundJob(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Background-Job": "true",
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error("Background job failed to queue:", error);
    });
  } catch (error) {
    console.error("Error queuing background job:", error);
  }
}
