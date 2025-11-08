import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, errorResponse, successResponse } from "@/lib/api/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const shareToken = crypto.randomUUID();

    const { error } = await supabase
      .from("analyses")
      .update({
        is_public: true,
        share_token: shareToken,
      })
      .eq("id", id)
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
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { error } = await supabase
      .from("analyses")
      .update({
        is_public: false,
        share_token: null,
      })
      .eq("id", id)
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
