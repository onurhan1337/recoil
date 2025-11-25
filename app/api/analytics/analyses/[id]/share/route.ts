import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
  ensureUserUsage,
  isProPlan,
} from "@/lib/api/utils";
import { uuidSchema } from "@/lib/validations";
import { validateParams } from "@/lib/validation-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idValidation = validateParams(uuidSchema, id, "analysis ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const usage = await ensureUserUsage(supabase, user.id);
    if (!isProPlan(usage?.plan)) {
      return errorResponse("Pro plan required for analytics", 403);
    }

    const shareToken = crypto.randomUUID();

    const { error } = await supabase
      .from("analyses")
      .update({
        is_public: true,
        share_token: shareToken,
      })
      .eq("id", idValidation.data)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return successResponse({ shareToken });
  } catch (error) {
    console.error("Error sharing analysis:", error);
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idValidation = validateParams(uuidSchema, id, "analysis ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const usage = await ensureUserUsage(supabase, user.id);
    if (!isProPlan(usage?.plan)) {
      return errorResponse("Pro plan required for analytics", 403);
    }

    const { error } = await supabase
      .from("analyses")
      .update({
        is_public: false,
        share_token: null,
      })
      .eq("id", idValidation.data)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Error unsharing analysis:", error);
    return errorResponse("Internal server error");
  }
}
