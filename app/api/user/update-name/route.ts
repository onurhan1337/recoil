import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return errorResponse("Display name is required", 400);
    }

    if (displayName.length > 50) {
      return errorResponse("Display name must be 50 characters or less", 400);
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
      },
    });

    if (error) {
      throw error;
    }

    return successResponse({
      message: "Display name updated successfully",
      display_name: displayName.trim(),
    });
  } catch (error) {
    console.error("Error updating display name:", error);
    return errorResponse("Internal server error");
  }
}
