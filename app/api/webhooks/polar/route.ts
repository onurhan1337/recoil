import { Webhooks } from "@polar-sh/nextjs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET!;

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

  if (error?.code === "PGRST116") {
    await supabase.from("usage").insert({
      user_id: userId,
      plan: "free",
      credits: config.plans.free.monthlyCredits,
      monthly_credits_limit: config.plans.free.monthlyCredits,
    });
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

  const { data: usage } = await supabase
    .from("usage")
    .select("user_id")
    .eq("polar_customer_id", customerId)
    .single();

  return usage?.user_id || null;
}

async function handleSubscriptionActivation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) return;

  await ensureUsageExists(supabase, userId);

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "pro",
      credits: config.plans.pro.monthlyCredits,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
      polar_customer_id: payload.data.customerId || payload.data.customer_id,
      polar_subscription_id: payload.data.id,
      subscription_status: payload.data.status,
      subscription_period_end:
        payload.data.currentPeriodEnd || payload.data.current_period_end,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionUpdate(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) return;

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
  if (!userId) return;

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "pro",
      subscription_status: "canceled",
      subscription_period_end:
        payload.data.currentPeriodEnd || payload.data.current_period_end,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionRevocation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) return;

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "free",
      credits: config.plans.free.monthlyCredits,
      monthly_credits_limit: config.plans.free.monthlyCredits,
      polar_subscription_id: null,
      subscription_status: "revoked",
      subscription_period_end: null,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleSubscriptionReactivation(payload: any) {
  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) return;

  await ensureUsageExists(supabase, userId);

  const { error } = await supabase
    .from("usage")
    .update({
      plan: "pro",
      credits: config.plans.pro.monthlyCredits,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
      polar_customer_id: payload.data.customerId || payload.data.customer_id,
      polar_subscription_id: payload.data.id,
      subscription_status: "active",
      subscription_period_end:
        payload.data.currentPeriodEnd || payload.data.current_period_end,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

async function handleOrderCreated(payload: any) {
  const billingReason =
    payload.data.billingReason || payload.data.billing_reason;
  if (billingReason !== "subscription_cycle") return;

  const supabase = createServiceRoleClient();
  const userId = await getUserIdFromPayload(payload, supabase);
  if (!userId) return;

  const { error } = await supabase
    .from("usage")
    .update({
      credits: config.plans.pro.monthlyCredits,
      monthly_credits_limit: config.plans.pro.monthlyCredits,
    })
    .eq("user_id", userId)
    .eq("plan", "pro");

  if (error) throw error;
}
