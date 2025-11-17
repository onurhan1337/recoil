import { createClient } from "@/lib/supabase/server";
import {
  authenticateUser,
  errorResponse,
  successResponse,
  ensureUserUsage,
} from "@/lib/api/utils";
import { polar } from "@/lib/polar/client";
import { config } from "@/lib/config";

/**
 * Manually sync subscription status from Polar
 * Use this when webhooks fail or to verify subscription status
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await ensureUserUsage(supabase, user.id);

    // Use getStateExternal to get customer state by external_id (Supabase user ID)
    let customerState;
    try {
      customerState = await polar.customers.getStateExternal({
        externalId: user.id,
      });
    } catch (error: any) {
      console.error("[Sync] Error getting customer state:", error);

      // If customer doesn't exist in Polar, set to free plan
      if (error.statusCode === 404 || error.message?.includes("not found")) {
        await supabase
          .from("usage")
          .update({
            plan: "free",
            credits: config.plans.free.monthlyCredits,
            monthly_credits_limit: config.plans.free.monthlyCredits,
            polar_customer_id: null,
            polar_subscription_id: null,
            subscription_status: null,
            subscription_period_end: null,
          })
          .eq("user_id", user.id);

        return successResponse({
          message: "No customer found in Polar",
          plan: "free",
          synced: true,
        });
      }

      throw error;
    }

    // Check if customer has active subscriptions (field is activeSubscriptions, not subscriptions!)
    const hasActiveSubscription =
      customerState.activeSubscriptions &&
      customerState.activeSubscriptions.length > 0;

    if (!hasActiveSubscription) {
      await supabase
        .from("usage")
        .update({
          plan: "free",
          credits: config.plans.free.monthlyCredits,
          monthly_credits_limit: config.plans.free.monthlyCredits,
          polar_customer_id: customerState.id || null,
          polar_subscription_id: null,
          subscription_status: "inactive",
          subscription_period_end: null,
        })
        .eq("user_id", user.id);

      return successResponse({
        message: "No active subscription found",
        plan: "free",
        synced: true,
      });
    }

    // Get the first active subscription
    const subscription = customerState.activeSubscriptions[0];

    // Validate subscription data from Polar
    if (!subscription.id) {
      throw new Error("[Sync] Invalid subscription: missing subscription ID");
    }

    if (!customerState.id) {
      throw new Error("[Sync] Invalid customer: missing customer ID");
    }

    const periodEnd = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toISOString()
      : null;

    // Prepare update
    const updateData = {
      plan: "pro" as const,
      credits: config.plans.pro.monthlyCredits,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
      polar_customer_id: customerState.id,
      polar_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
    };

    // Update to pro plan
    const { data: afterState, error: updateError } = await supabase
      .from("usage")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Sync] Database update error:", updateError);
      throw updateError;
    }

    // Verify critical fields
    if (afterState.plan !== "pro") {
      throw new Error(
        `[Sync] Verification failed: plan is ${afterState.plan}, expected pro`
      );
    }

    if (afterState.credits !== config.plans.pro.monthlyCredits) {
      console.warn(
        `[Sync] Warning: credits is ${afterState.credits}, expected ${config.plans.pro.monthlyCredits}`
      );
    }

    if (afterState.polar_subscription_id !== subscription.id) {
      throw new Error(
        `[Sync] Verification failed: subscription_id mismatch (${afterState.polar_subscription_id} vs ${subscription.id})`
      );
    }

    return successResponse({
      message: "Subscription synced successfully",
      plan: "pro",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      synced: true,
    });
  } catch (error) {
    console.error("[Sync] Fatal error:", error);
    return errorResponse("Failed to sync subscription", 500);
  }
}
