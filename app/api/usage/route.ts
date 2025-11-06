import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  ensureUserUsage,
} from "@/lib/api/utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const usage = await ensureUserUsage(supabase, user.id);
    return successResponse(usage);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return errorResponse("Internal server error");
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: usage, error } = await supabase
      .from("usage")
      .update({
        credits: 100,
        last_reset: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return successResponse(usage);
  } catch (error) {
    console.error("Error resetting usage:", error);
    return errorResponse("Internal server error");
  }
}
