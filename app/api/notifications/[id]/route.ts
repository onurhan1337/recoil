import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateParams } from "@/lib/validation-utils";

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
    const idValidation = validateParams(uuidSchema, id, "notification ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !notification) {
      return errorResponse("Notification not found", 404);
    }

    if (notification.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { data: updatedNotification, error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", idValidation.data)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({
      notification: updatedNotification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
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
    const idValidation = validateParams(uuidSchema, id, "notification ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !notification) {
      return errorResponse("Notification not found", 404);
    }

    if (notification.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", idValidation.data);

    if (deleteError) {
      throw deleteError;
    }

    return successResponse({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return errorResponse("Internal server error");
  }
}
