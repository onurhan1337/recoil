import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema, reminderUpdateSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateParams, validateRequest } from "@/lib/validation-utils";

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
    const idValidation = validateParams(uuidSchema, id, "reminder ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const body = await request.json();
    const validation = validateRequest(reminderUpdateSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { data: reminder, error: fetchError } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !reminder) {
      return errorResponse("Reminder not found", 404);
    }

    if (reminder.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { data: updatedReminder, error: updateError } = await supabase
      .from("reminders")
      .update(validation.data)
      .eq("id", idValidation.data)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({
      reminder: updatedReminder,
      message: "Reminder updated successfully",
    });
  } catch (error) {
    console.error("Error updating reminder:", error);
    return errorResponse("Internal server error");
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
    const idValidation = validateParams(uuidSchema, id, "reminder ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: reminder, error: fetchError } = await supabase
      .from("reminders")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !reminder) {
      return errorResponse("Reminder not found", 404);
    }

    if (reminder.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { error: deleteError } = await supabase
      .from("reminders")
      .delete()
      .eq("id", idValidation.data);

    if (deleteError) {
      throw deleteError;
    }

    return successResponse({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return errorResponse("Internal server error");
  }
}
