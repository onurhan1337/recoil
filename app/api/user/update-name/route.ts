import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { displayNameSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = displayNameSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request",
        400
      );
    }

    const { displayName } = validation.data;

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
      },
    });

    if (error) {
      throw error;
    }

    return successResponse({
      message: "Display name updated successfully",
      display_name: displayName,
    });
  } catch (error) {
    console.error("Error updating display name:", error);
    return errorResponse("Internal server error");
  }
}
