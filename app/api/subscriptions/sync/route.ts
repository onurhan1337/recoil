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

    let customerState;
    try {
      customerState = await polar.customers.getStateExternal({
        externalId: user.id,
      });
    } catch (error: any) {
      console.error("[Sync] Error getting customer state:", error);

      if (error.statusCode === 404 || error.message?.includes("not found")) {
        const { error: updateError } = await supabase
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

        if (updateError) {
          console.error("[Sync] Database update error:", updateError);
          return errorResponse("Failed to sync subscription", 500);
        }

        return successResponse({
          message: "No customer found in Polar",
          plan: "free",
          synced: true,
        });
      }

      throw error;
    }

    const hasActiveSubscription =
      customerState.activeSubscriptions &&
      customerState.activeSubscriptions.length > 0;

    if (!hasActiveSubscription) {
      const { error: updateError } = await supabase
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

      if (updateError) {
        console.error("[Sync] Database update error:", updateError);
        return errorResponse("Failed to sync subscription", 500);
      }

      return successResponse({
        message: "No active subscription found",
        plan: "free",
        synced: true,
      });
    }

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

    let actualStatus: string = subscription.status;
    if (subscription.cancelAtPeriodEnd) {
      actualStatus = "canceled";
      console.log(
        `[Sync] Subscription ${subscription.id} is scheduled for cancellation at ${periodEnd}, setting status to 'canceled'`
      );
    }

    const { data: currentUsage } = await supabase
      .from("usage")
      .select("credits, subscription_status")
      .eq("user_id", user.id)
      .single();

    const shouldResetCredits =
      actualStatus === "active" &&
      (currentUsage?.subscription_status === "canceled" ||
        currentUsage?.subscription_status === "cancelled" ||
        currentUsage?.subscription_status === "inactive" ||
        currentUsage?.subscription_status === "revoked" ||
        currentUsage?.subscription_status === "expired" ||
        !currentUsage?.subscription_status);

    const updateData: any = {
      plan: "pro" as const,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
      polar_customer_id: customerState.id,
      polar_subscription_id: subscription.id,
      subscription_status: actualStatus,
      subscription_period_end: periodEnd,
    };

    if (shouldResetCredits) {
      updateData.credits = config.plans.pro.monthlyCredits;
      console.log(
        `[Sync] Resetting credits for user ${user.id}: activating subscription`
      );
    } else {
      console.log(
        `[Sync] Preserving existing credits for user ${user.id}: current status=${currentUsage?.subscription_status}, new status=${actualStatus}`
      );
    }

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

    console.log(
      `✓ [Sync] Successfully synced subscription for user ${user.id}:`,
      {
        plan: afterState.plan,
        subscription_status: afterState.subscription_status,
        subscription_period_end: afterState.subscription_period_end,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      }
    );

    return successResponse({
      message: "Subscription synced successfully",
      plan: "pro",
      subscription: {
        id: subscription.id,
        status: actualStatus,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      synced: true,
    });
  } catch (error) {
    console.error("[Sync] Fatal error:", error);
    return errorResponse("Failed to sync subscription", 500);
  }
}
