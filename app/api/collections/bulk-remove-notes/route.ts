import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";

const bulkRemoveNotesSchema = z.object({
  collectionId: z.string().uuid(),
  noteIds: z
    .array(z.string().uuid())
    .min(1, "At least one note ID is required")
    .max(100, "Cannot remove more than 100 notes at once"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(bulkRemoveNotesSchema, body);

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

    const { error: deleteError } = await supabase
      .from("note_collections")
      .delete()
      .eq("collection_id", collectionId)
      .in("note_id", noteIds);

    if (deleteError) {
      console.error("Failed to remove notes from collection:", deleteError);
      return errorResponse("Failed to remove notes from collection", 500);
    }

    return successResponse({
      success: true,
      removedCount: noteIds.length,
    });
  } catch (error) {
    console.error("Error in bulk remove from collection:", error);
    return errorResponse("Internal server error");
  }
}
