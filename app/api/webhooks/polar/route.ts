import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";

/**
 * Handle Polar webhook events for subscription lifecycle
 * Using @polar-sh/nextjs Webhooks handler for automatic signature verification
 */
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // Handle subscription created event
  onSubscriptionCreated: async (payload) => {
    console.log("📨 Webhook: subscription.created", payload.data.id);
    await handleSubscriptionActivation(payload);
  },

  // Handle subscription active event
  onSubscriptionActive: async (payload) => {
    console.log("📨 Webhook: subscription.active", payload.data.id);
    await handleSubscriptionActivation(payload);
  },

  // Handle subscription updated event
  onSubscriptionUpdated: async (payload) => {
    console.log("📨 Webhook: subscription.updated", payload.data.id);
    await handleSubscriptionUpdate(payload);
  },

  // Handle subscription canceled event
  onSubscriptionCanceled: async (payload) => {
    console.log("📨 Webhook: subscription.canceled", payload.data.id);
    await handleSubscriptionCancellation(payload);
  },

  // Handle subscription revoked event
  onSubscriptionRevoked: async (payload) => {
    console.log("📨 Webhook: subscription.revoked", payload.data.id);
    await handleSubscriptionRevocation(payload);
  },

  // Catch-all for any other events
  onPayload: async (payload) => {
    console.log("📨 Webhook: unhandled event type", payload.type);
  },
});

/**
 * Handle subscription activation (created or active)
 */
async function handleSubscriptionActivation(payload: any) {
  const supabase = await createClient();
  const userId = await getUserIdFromPayload(payload, supabase);

  if (!userId) return;

  console.log(`[Webhook Activation] Processing for user: ${userId}`);
  console.log(`[Webhook Activation] Payload data:`, JSON.stringify(payload.data, null, 2));

  // Get current state BEFORE activation
  const { data: beforeState } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  console.log("[Webhook Activation] Current state:", {
    plan: beforeState?.plan,
    credits: beforeState?.credits,
    subscription_id: beforeState?.polar_subscription_id,
    subscription_status: beforeState?.subscription_status,
  });

  // Validate payload data from Polar
  if (!payload.data.id) {
    throw new Error("[Webhook Activation] Invalid payload: missing subscription ID");
  }

  const customerId = payload.data.customerId || payload.data.customer_id;
  if (!customerId) {
    throw new Error("[Webhook Activation] Invalid payload: missing customer ID");
  }

  const currentPeriodEnd = payload.data.currentPeriodEnd || payload.data.current_period_end;

  // Prepare update data
  const updateData = {
    plan: "pro" as const,
    credits: config.plans.pro.monthlyCredits,
    monthly_credits_limit: config.plans.pro.monthlyCredits,
    polar_customer_id: customerId,
    polar_subscription_id: payload.data.id,
    subscription_status: payload.data.status,
    subscription_period_end: currentPeriodEnd,
  };

  console.log("[Webhook Activation] Updating to:", updateData);

  // Perform update and get result
  const { data: afterState, error } = await supabase
    .from("usage")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(`[Webhook Activation] Database update error for user ${userId}:`, error);
    throw error;
  }

  // Verify the update
  console.log("[Webhook Activation] After activation:", {
    plan: afterState.plan,
    credits: afterState.credits,
    subscription_id: afterState.polar_subscription_id,
    subscription_status: afterState.subscription_status,
    period_end: afterState.subscription_period_end,
  });

  // Verify critical fields
  if (afterState.plan !== "pro") {
    throw new Error(
      `[Webhook Activation] Verification failed: plan is ${afterState.plan}, expected pro`
    );
  }

  if (afterState.credits !== config.plans.pro.monthlyCredits) {
    console.warn(
      `[Webhook Activation] Warning: credits is ${afterState.credits}, expected ${config.plans.pro.monthlyCredits}`
    );
  }

  if (afterState.polar_subscription_id !== payload.data.id) {
    throw new Error(
      `[Webhook Activation] Verification failed: subscription_id mismatch (${afterState.polar_subscription_id} vs ${payload.data.id})`
    );
  }

  console.log(`✅ [Webhook Activation] Successfully upgraded user ${userId} to pro and verified`);
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(payload: any) {
  const supabase = await createClient();
  const userId = await getUserIdFromPayload(payload, supabase);

  if (!userId) return;

  const currentPeriodEnd = payload.data.currentPeriodEnd || payload.data.current_period_end;
  const updateData: any = {
    subscription_status: payload.data.status,
    subscription_period_end: currentPeriodEnd,
  };

  // If subscription is canceled but still active (grace period)
  // Keep pro plan until period_end
  if (payload.data.status === "canceled" || payload.data.status === "cancelled") {
    updateData.plan = "pro"; // Will be downgraded when revoked
  }

  const { error } = await supabase
    .from("usage")
    .update(updateData)
    .eq("user_id", userId);

  if (error) {
    console.error(`❌ Error updating subscription for user ${userId}:`, error);
    throw error;
  }

  console.log(`📝 Subscription updated for user ${userId}, status: ${payload.data.status}`);
}

/**
 * Handle subscription cancellation (keeps pro until period end)
 */
async function handleSubscriptionCancellation(payload: any) {
  const supabase = await createClient();
  const userId = await getUserIdFromPayload(payload, supabase);

  if (!userId) return;

  const currentPeriodEnd = payload.data.currentPeriodEnd || payload.data.current_period_end;

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "pro", // Keep pro until revoked
      subscription_status: "canceled",
      subscription_period_end: currentPeriodEnd,
    })
    .eq("user_id", userId);

  if (error) {
    console.error(`❌ Error canceling subscription for user ${userId}:`, error);
    throw error;
  }

  console.log(`⏸️ Subscription canceled for user ${userId} (active until ${currentPeriodEnd})`);
}

/**
 * Handle subscription revocation (immediate downgrade)
 */
async function handleSubscriptionRevocation(payload: any) {
  const supabase = await createClient();
  const userId = await getUserIdFromPayload(payload, supabase);

  if (!userId) return;

  console.log(`[Webhook Revocation] Processing for user: ${userId}`);
  console.log(`[Webhook Revocation] Payload data:`, JSON.stringify(payload.data, null, 2));

  // Get current state BEFORE revocation
  const { data: beforeState } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  console.log("[Webhook Revocation] Current state:", {
    plan: beforeState?.plan,
    credits: beforeState?.credits,
    subscription_id: beforeState?.polar_subscription_id,
    subscription_status: beforeState?.subscription_status,
  });

  // Validate payload data from Polar
  if (!payload.data.id) {
    throw new Error("[Webhook Revocation] Invalid payload: missing subscription ID");
  }

  // Prepare update data
  const updateData = {
    plan: "free" as const,
    credits: config.plans.free.monthlyCredits,
    monthly_credits_limit: config.plans.free.monthlyCredits,
    polar_subscription_id: null,
    subscription_status: "revoked",
    subscription_period_end: null,
  };

  console.log("[Webhook Revocation] Updating to:", updateData);

  // Perform update and get result
  const { data: afterState, error } = await supabase
    .from("usage")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(`[Webhook Revocation] Database update error for user ${userId}:`, error);
    throw error;
  }

  // Verify the update
  console.log("[Webhook Revocation] After revocation:", {
    plan: afterState.plan,
    credits: afterState.credits,
    subscription_id: afterState.polar_subscription_id,
    subscription_status: afterState.subscription_status,
    period_end: afterState.subscription_period_end,
  });

  // Verify critical fields
  if (afterState.plan !== "free") {
    throw new Error(
      `[Webhook Revocation] Verification failed: plan is ${afterState.plan}, expected free`
    );
  }

  if (afterState.credits !== config.plans.free.monthlyCredits) {
    console.warn(
      `[Webhook Revocation] Warning: credits is ${afterState.credits}, expected ${config.plans.free.monthlyCredits}`
    );
  }

  if (afterState.polar_subscription_id !== null) {
    throw new Error(
      `[Webhook Revocation] Verification failed: subscription_id should be null but is ${afterState.polar_subscription_id}`
    );
  }

  console.log(`✅ [Webhook Revocation] Successfully downgraded user ${userId} to free and verified`);
}

/**
 * Extract user ID from webhook payload
 */
async function getUserIdFromPayload(payload: any, supabase: any): Promise<string | null> {
  // First try to get user_id from metadata
  const userId = payload.data.metadata?.user_id;
  if (userId) return userId;

  // Fallback: Find user by polar_customer_id
  const customerId = payload.data.customerId || payload.data.customer_id;
  if (!customerId) {
    console.error("❌ No customer ID in webhook event");
    return null;
  }

  const { data: usage, error } = await supabase
    .from("usage")
    .select("user_id")
    .eq("polar_customer_id", customerId)
    .single();

  if (error || !usage) {
    console.error("❌ User not found for customer:", customerId, error);
    return null;
  }

  return usage.user_id;
}
