import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
  ensureUserUsage,
} from "@/lib/api/utils";
import { polar } from "@/lib/polar/client";

/**
 * Get Polar customer portal URL for subscription management
 * Allows users to:
 * - Cancel subscription
 * - Update payment method
 * - View billing history
 * - Manage subscription settings
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const usage = await ensureUserUsage(supabase, user.id);

    if (!usage.polar_customer_id) {
      return errorResponse(
        "No subscription found. Please subscribe first.",
        404
      );
    }

    try {
      const customerSession = await polar.customerSessions.create({
        customerId: usage.polar_customer_id,
      });

      if (!customerSession.customerPortalUrl) {
        throw new Error("Customer portal URL not returned from Polar");
      }

      return successResponse({
        url: customerSession.customerPortalUrl,
      });
    } catch (error: any) {
      console.error("[Portal] Error creating customer portal session:", error);

      if (error.statusCode === 404 || error.message?.includes("not found")) {
        return errorResponse(
          "Customer not found in Polar. Please contact support.",
          404
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("[Portal] Fatal error:", error);
    return errorResponse("Failed to create customer portal session", 500);
  }
}
