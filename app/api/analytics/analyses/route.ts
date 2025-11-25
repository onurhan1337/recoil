import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
  ensureUserUsage,
  isProPlan,
} from "@/lib/api/utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const usage = await ensureUserUsage(supabase, user.id);
    if (!isProPlan(usage?.plan)) {
      return errorResponse("Pro plan required for analytics", 403);
    }

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse(analyses);
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return errorResponse("Internal server error");
  }
}
