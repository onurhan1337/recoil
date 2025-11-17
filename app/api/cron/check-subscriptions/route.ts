import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  isSubscriptionActive,
} from "@/lib/api/utils";
import { NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Cron job to check and downgrade expired subscriptions
 * Should be called periodically (e.g., every hour)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[Cron] CRON_SECRET is not configured");
      return errorResponse("[Cron] Cron secret not configured", 500);
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("[Cron] Unauthorized", 401);
    }

    const supabase = await createClient();

    // Get all users with pro plan
    const { data: proUsers, error: fetchError } = await supabase
      .from("usage")
      .select("*")
      .eq("plan", "pro");

    if (fetchError) {
      throw fetchError;
    }

    if (!proUsers || proUsers.length === 0) {
      return successResponse({
        message: "[Cron] No pro users to check",
        processed: 0,
        downgraded: 0,
      });
    }

    let downgraded = 0;

    // Check each pro user's subscription status
    for (const usage of proUsers) {
      const isActive = isSubscriptionActive(
        usage.subscription_status,
        usage.subscription_period_end
      );

      if (!isActive) {
        console.log(`[Cron] Downgrading expired user: ${usage.user_id}`);

        // Downgrade to free
        const { error: updateError } = await supabase
          .from("usage")
          .update({
            plan: "free",
            credits: config.plans.free.monthlyCredits,
            monthly_credits_limit: config.plans.free.monthlyCredits,
            subscription_status: "expired",
          })
          .eq("user_id", usage.user_id);

        if (updateError) {
          console.error(
            `[Cron] Error downgrading user ${usage.user_id}:`,
            updateError
          );
        } else {
          downgraded++;
        }
      }
    }

    return successResponse({
      message: "[Cron] Subscription check completed",
      processed: proUsers.length,
      downgraded,
    });
  } catch (error) {
    console.error("[Cron] Error checking subscriptions:", error);
    return errorResponse("[Cron] Failed to check subscriptions", 500);
  }
}
