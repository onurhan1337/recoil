import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { uuidSchema, conversationUpdateSchema } from "@/lib/validations";
import { validateParams, validateRequest } from "@/lib/validation-utils";

export async function GET(
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
    const idValidation = validateParams(uuidSchema, id, "conversation ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", idValidation.data)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return successResponse({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
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
    const idValidation = validateParams(uuidSchema, id, "conversation ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", idValidation.data)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return errorResponse("Internal server error");
  }
}

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
    const idValidation = validateParams(uuidSchema, id, "conversation ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const body = await request.json();
    const validation = validateRequest(conversationUpdateSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { title } = validation.data;

    const { data: conversation, error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", idValidation.data)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return successResponse({ conversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return errorResponse("Internal server error");
  }
}
