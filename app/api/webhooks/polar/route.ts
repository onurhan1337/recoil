import { Webhooks } from "@polar-sh/nextjs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { isProPlan, isSubscriptionActive } from "@/lib/api/utils";

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("POLAR_WEBHOOK_SECRET is not configured");
}

export const POST = Webhooks({
  webhookSecret,
  onSubscriptionCreated: async (payload) => {
    await handleSubscriptionActivation(payload);
  },
  onSubscriptionActive: async (payload) => {
    await handleSubscriptionActivation(payload);
  },
  onSubscriptionUpdated: async (payload) => {
    await handleSubscriptionUpdate(payload);
  },
  onSubscriptionCanceled: async (payload) => {
    await handleSubscriptionCancellation(payload);
  },
  onSubscriptionUncanceled: async (payload) => {
    await handleSubscriptionReactivation(payload);
  },
  onSubscriptionRevoked: async (payload) => {
    await handleSubscriptionRevocation(payload);
  },
  onOrderCreated: async (payload) => {
    await handleOrderCreated(payload);
  },
});

async function ensureUsageExists(supabase: any, userId: string) {
  const { error } = await supabase
    .from("usage")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (error?.code === "PGRST116") {
    const { error: insertError } = await supabase.from("usage").insert({
      user_id: userId,
      plan: "free",
      credits: config.plans.free.monthlyCredits,
      monthly_credits_limit: config.plans.free.monthlyCredits,
    });

    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }
  }
}

async function getUserIdFromPayload(
  payload: any,
  supabase: any
): Promise<string | null> {
  const userId = payload.data.metadata?.user_id;
  if (userId) return userId;

  const customerId = payload.data.customerId || payload.data.customer_id;
  if (!customerId) return null;

  const { data: usage, error } = await supabase
    .from("usage")
    .select("user_id")
    .eq("polar_customer_id", customerId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return usage?.user_id || null;
}

async function handleSubscriptionActivation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  await ensureUsageExists(supabase, userId);

  const { data: currentUsage, error: fetchError } = await supabase
    .from("usage")
    .select("plan")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const isUpgrade = !isProPlan(currentUsage?.plan);

  const updateData: any = {
    plan: "pro",
    monthly_credits_limit: config.plans.pro.monthlyCredits,
    polar_customer_id: payload.data.customerId || payload.data.customer_id,
    polar_subscription_id: payload.data.id,
    subscription_status: payload.data.status,
    subscription_period_end:
      payload.data.currentPeriodEnd || payload.data.current_period_end,
  };

  if (isUpgrade) {
    updateData.credits = config.plans.pro.monthlyCredits;
  }

  const { error } = await supabase
    .from("usage")
    .update(updateData)
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionUpdate(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  const { error } = await supabase
    .from("usage")
    .update({
      subscription_status: payload.data.status,
      subscription_period_end:
        payload.data.currentPeriodEnd || payload.data.current_period_end,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionCancellation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  const periodEnd =
    payload.data.currentPeriodEnd || payload.data.current_period_end;
  const status = payload.data.status;

  const isActive = isSubscriptionActive(status, periodEnd);
  const plan = isActive ? "pro" : "free";

  const { error } = await supabase
    .from("usage")
    .update({
      plan,
      subscription_status: status,
      subscription_period_end: periodEnd,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionRevocation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "free",
      credits: config.plans.free.monthlyCredits,
      monthly_credits_limit: config.plans.free.monthlyCredits,
      polar_subscription_id: null,
      subscription_status: payload.data.status,
      subscription_period_end: null,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionReactivation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  await ensureUsageExists(supabase, userId);

  const { data: currentUsage, error: fetchError } = await supabase
    .from("usage")
    .select("plan")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const isUpgrade = !isProPlan(currentUsage?.plan);

  const updateData: any = {
    plan: "pro",
    monthly_credits_limit: config.plans.pro.monthlyCredits,
    polar_customer_id: payload.data.customerId || payload.data.customer_id,
    polar_subscription_id: payload.data.id,
    subscription_status: payload.data.status,
    subscription_period_end:
      payload.data.currentPeriodEnd || payload.data.current_period_end,
  };

  if (isUpgrade) {
    updateData.credits = config.plans.pro.monthlyCredits;
  }

  const { error } = await supabase
    .from("usage")
    .update(updateData)
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleOrderCreated(payload: any) {
  const billingReason =
    payload.data.billingReason || payload.data.billing_reason;
  if (billingReason !== "subscription_cycle") {
    return;
  }

  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) {
    console.error("[Webhook] Could not resolve user ID from payload:", {
      customerId: payload.data?.customerId || payload.data?.customer_id,
      subscriptionId: payload.data?.id,
      metadata: payload.data?.metadata,
    });
    return;
  }

  const orderId = payload.data.id;
  if (!orderId) {
    return;
  }

  const { data: currentUsage, error: fetchError } = await supabase
    .from("usage")
    .select("last_processed_order_id, plan")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  if (!currentUsage || !isProPlan(currentUsage.plan)) {
    return;
  }

  if (currentUsage.last_processed_order_id === orderId) {
    return;
  }

  const { error } = await supabase
    .from("usage")
    .update({
      credits: config.plans.pro.monthlyCredits,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
      last_processed_order_id: orderId,
    })
    .eq("user_id", userId)
    .eq("plan", "pro");

  if (error) throw error;
}
