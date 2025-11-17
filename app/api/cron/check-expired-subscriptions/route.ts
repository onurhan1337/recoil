import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  isSubscriptionActive,
} from "@/lib/api/utils";
import { NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Cron job to check for expired subscriptions and downgrade users
 * Should be called daily (or more frequently) to catch expired subscriptions
 *
 * This handles the case where:
 * - User cancels subscription on Jan 10
 * - Subscription period ends on Feb 1
 * - User should be downgraded to free on Feb 1
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[Cron Expired] CRON_SECRET is not configured");
      return errorResponse("[Cron Expired] Cron secret not configured", 500);
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("[Cron Expired] Unauthorized", 401);
    }

    const supabase = createServiceRoleClient();

    // Find all pro users with subscription data
    const { data: proUsers, error: fetchError } = await supabase
      .from("usage")
      .select("*")
      .eq("plan", "pro")
      .not("subscription_status", "is", null);

    if (fetchError) {
      throw fetchError;
    }

    if (!proUsers || proUsers.length === 0) {
      return successResponse({
        message: "[Cron Expired] No pro users to check",
        checked: 0,
        downgraded: 0,
      });
    }

    let downgraded = 0;

    for (const usage of proUsers) {
      const isActive = isSubscriptionActive(
        usage.subscription_status,
        usage.subscription_period_end
      );

      // If subscription is no longer active, downgrade to free
      if (!isActive) {
        console.log(
          `[Cron Expired] Downgrading user ${usage.user_id} from pro to free (status: ${usage.subscription_status}, period_end: ${usage.subscription_period_end})`
        );

        // Determine the status to write (preserve terminal statuses)
        const terminalStatuses = ["revoked", "canceled"];
        const statusToWrite = terminalStatuses.includes(
          usage.subscription_status || ""
        )
          ? usage.subscription_status
          : "expired";

        const { error: updateError } = await supabase
          .from("usage")
          .update({
            plan: "free",
            credits: config.plans.free.monthlyCredits,
            monthly_credits_limit: config.plans.free.monthlyCredits,
            subscription_status: statusToWrite,
          })
          .eq("user_id", usage.user_id)
          .eq("plan", "pro"); // Ensure we only downgrade if still pro

        if (updateError) {
          console.error(
            `[Cron Expired] Error downgrading user ${usage.user_id}:`,
            updateError
          );
        } else {
          downgraded++;
          console.log(
            `[Cron Expired] Successfully downgraded user ${usage.user_id} to free plan`
          );
        }
      }
    }

    return successResponse({
      message: "[Cron Expired] Subscription expiration check completed",
      checked: proUsers.length,
      downgraded,
    });
  } catch (error) {
    console.error("[Cron Expired] Error checking expired subscriptions:", error);
    return errorResponse(
      "[Cron Expired] Failed to check expired subscriptions",
      500
    );
  }
}
