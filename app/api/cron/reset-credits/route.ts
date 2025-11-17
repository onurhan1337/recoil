import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  isSubscriptionActive,
} from "@/lib/api/utils";
import { NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Cron job to reset monthly credits for all users
 * Should be called on the 1st of each month
 *
 * For Pro users: Only resets if subscription is active
 * For Free users: Always resets to free plan limit
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[Cron Reset] CRON_SECRET is not configured");
      return errorResponse("[Cron Reset] Cron secret not configured", 500);
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("[Cron Reset] Unauthorized", 401);
    }

    const supabase = await createClient();

    const { data: allUsers, error: fetchError } = await supabase
      .from("usage")
      .select("*");

    if (fetchError) {
      throw fetchError;
    }

    if (!allUsers || allUsers.length === 0) {
      return successResponse({
        message: "[Cron Reset] No users to process",
        processed: 0,
        free_reset: 0,
        pro_reset: 0,
        pro_skipped: 0,
      });
    }

    let freeReset = 0;
    let proReset = 0;
    let proSkipped = 0;

    for (const usage of allUsers) {
      if (usage.plan === "pro") {
        const isActive = isSubscriptionActive(
          usage.subscription_status,
          usage.subscription_period_end
        );

        if (isActive) {
          const { error: updateError } = await supabase
            .from("usage")
            .update({
              credits: config.plans.pro.monthlyCredits,
              monthly_credits_limit: config.plans.pro.monthlyCredits,
            })
            .eq("user_id", usage.user_id);

          if (updateError) {
            console.error(
              `[Cron Reset] Error resetting pro credits for user ${usage.user_id}:`,
              updateError
            );
          } else {
            proReset++;
            console.log(
              `[Cron Reset] Reset pro credits for user ${usage.user_id}: ${usage.credits} → ${config.plans.pro.monthlyCredits}`
            );
          }
        } else {
          proSkipped++;
          console.log(
            `[Cron Reset] Skipped inactive pro user ${usage.user_id} (status: ${usage.subscription_status})`
          );
        }
      } else {
        const { error: updateError } = await supabase
          .from("usage")
          .update({
            credits: config.plans.free.monthlyCredits,
            monthly_credits_limit: config.plans.free.monthlyCredits,
          })
          .eq("user_id", usage.user_id);

        if (updateError) {
          console.error(
            `[Cron Reset] Error resetting free credits for user ${usage.user_id}:`,
            updateError
          );
        } else {
          freeReset++;
          console.log(
            `[Cron Reset] Reset free credits for user ${usage.user_id}: ${usage.credits} → ${config.plans.free.monthlyCredits}`
          );
        }
      }
    }

    return successResponse({
      message: "[Cron Reset] Monthly credit reset completed",
      processed: allUsers.length,
      free_reset: freeReset,
      pro_reset: proReset,
      pro_skipped: proSkipped,
    });
  } catch (error) {
    console.error("[Cron Reset] Error resetting credits:", error);
    return errorResponse("[Cron Reset] Failed to reset credits", 500);
  }
}
