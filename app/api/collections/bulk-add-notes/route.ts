import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";

const bulkAddNotesSchema = z.object({
  collectionId: z.string().uuid(),
  noteIds: z
    .array(z.string().uuid())
    .min(1, "At least one note ID is required")
    .max(100, "Cannot add more than 100 notes at once"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(bulkAddNotesSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { collectionId, noteIds } = validation.data;

    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (!collection) {
      return errorResponse("Collection not found", 404);
    }

    const { data: notes } = await supabase
      .from("notes")
      .select("id")
      .in("id", noteIds)
      .eq("user_id", user.id);

    if (!notes || notes.length === 0) {
      return errorResponse("No valid notes found", 404);
    }

    const validNoteIds = notes.map((n) => n.id);

    const { data: existingRelations } = await supabase
      .from("note_collections")
      .select("note_id")
      .eq("collection_id", collectionId)
      .in("note_id", validNoteIds);

    const existingNoteIds = new Set(
      existingRelations?.map((r) => r.note_id) || []
    );

    const notesToAdd = validNoteIds.filter(
      (noteId) => !existingNoteIds.has(noteId)
    );

    if (notesToAdd.length === 0) {
      return successResponse({
        success: true,
        addedCount: 0,
        skippedCount: validNoteIds.length,
        message: "All notes are already in this collection",
      });
    }

    const insertData = notesToAdd.map((noteId) => ({
      collection_id: collectionId,
      note_id: noteId,
    }));

    const { error: insertError } = await supabase
      .from("note_collections")
      .insert(insertData);

    if (insertError) {
      console.error("Failed to add notes to collection:", insertError);
      return errorResponse("Failed to add notes to collection", 500);
    }

    return successResponse({
      success: true,
      addedCount: notesToAdd.length,
      skippedCount: existingNoteIds.size,
    });
  } catch (error) {
    console.error("Error in bulk add to collection:", error);
    return errorResponse("Internal server error");
  }
}
