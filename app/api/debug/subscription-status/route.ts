import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
} from "@/lib/api/utils";
import { NextRequest } from "next/server";

/**
 * Debug endpoint to check current subscription status in database
 * GET /api/debug/subscription-status
 */
export async function GET(request: NextRequest) {
  try {
    const debugToken = process.env.DEBUG_TOKEN!;
    const authHeader = request.headers.get("authorization");

    if (!debugToken || authHeader !== `Bearer ${debugToken}`) {
      return errorResponse("Unauthorized", 401);
    }

    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: usage, error } = await supabase
      .from("usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return successResponse({
      user_id: user.id,
      current_status: {
        plan: usage.plan,
        credits: usage.credits,
        monthly_credits_limit: usage.monthly_credits_limit,
        polar_customer_id: usage.polar_customer_id,
        polar_subscription_id: usage.polar_subscription_id,
        subscription_status: usage.subscription_status,
        subscription_period_end: usage.subscription_period_end,
      },
    });
  } catch (error) {
    console.error("[Debug] Error fetching subscription status:", error);
    return errorResponse("Internal server error", 500);
  }
}
