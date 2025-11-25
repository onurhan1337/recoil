import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import { updateJournalEntrySchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateJournalEntrySchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { content } = validation.data;

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const { data: entry, error: updateError } = await supabase
      .from("journal_entries")
      .update({
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return errorResponse("Journal entry not found", 404);
      }
      return errorResponse("Failed to update journal entry", 500);
    }

    return successResponse({
      success: true,
      entry,
    });
  } catch (error) {
    return errorResponse("Failed to update journal entry", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const { error: deleteError } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return errorResponse("Failed to delete journal entry", 500);
    }

    return successResponse({
      success: true,
    });
  } catch (error) {
    return errorResponse("Failed to delete journal entry", 500);
  }
}
