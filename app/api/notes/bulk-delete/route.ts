import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";

const bulkDeleteSchema = z.object({
  noteIds: z
    .array(z.string().uuid())
    .min(1, "At least one note ID is required")
    .max(100, "Cannot delete more than 100 notes at once"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(bulkDeleteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { noteIds } = validation.data;

    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .in("id", noteIds)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to delete notes:", deleteError);
      return errorResponse("Failed to delete notes", 500);
    }

    return successResponse({
      success: true,
      deletedCount: noteIds.length,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return errorResponse("Internal server error");
  }
}
