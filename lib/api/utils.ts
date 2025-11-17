import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserPlan } from "./types";
import { config } from "@/lib/config";

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, headers?: HeadersInit) {
  return NextResponse.json(data, { headers });
}

export function calculateNoteCost(content: string, userPlan: UserPlan) {
  const baseCost = config.plans[userPlan].costs.createNote;
  const contentLength = content.length;
  const chunkSize = config.embeddings.chunkSize;
  const estimatedChunks = Math.ceil(contentLength / chunkSize);
  const embeddingCostPerChunk = config.plans[userPlan].costs.embedding;
  const additionalEmbeddingCost = Math.max(
    0,
    (estimatedChunks - 1) * embeddingCostPerChunk
  );
  const totalCost = baseCost + additionalEmbeddingCost;

  return {
    totalCost,
    baseCost,
    embeddingCost: additionalEmbeddingCost,
    contentLength,
    estimatedChunks,
  };
}

export async function authenticateUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function ensureUserUsage(
  supabase: SupabaseClient,
  userId: string,
  defaultCredits: number = config.plans.free.monthlyCredits
) {
  const { data: usage, error } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error?.code === "PGRST116") {
    const { data: newUsage, error: insertError } = await supabase
      .from("usage")
      .insert({
        user_id: userId,
        credits: defaultCredits,
        plan: "free",
        monthly_credits_limit: config.plans.free.monthlyCredits,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newUsage;
  }

  if (error) throw error;

  // Check if pro subscription has expired
  if (
    usage.plan === "pro" &&
    !isSubscriptionActive(
      usage.subscription_status,
      usage.subscription_period_end
    )
  ) {
    console.log(
      `[Usage] Subscription expired for user ${userId}, downgrading to free`
    );

    // Downgrade to free
    const { data: updatedUsage } = await supabase
      .from("usage")
      .update({
        plan: "free",
        credits: config.plans.free.monthlyCredits,
        monthly_credits_limit: config.plans.free.monthlyCredits,
        subscription_status: "expired",
      })
      .eq("user_id", userId)
      .select()
      .single();

    return updatedUsage || usage;
  }

  return usage;
}

export async function decrementCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number = 1
) {
  const { data, error } = await supabase.rpc("decrement_credits", {
    user_id: userId,
    amount,
  });

  if (error) throw error;
  return data;
}

export function getUserPlan(plan: string | undefined | null): UserPlan {
  return plan === "pro" ? "pro" : "free";
}

export function isProPlan(plan: string | undefined | null): boolean {
  return plan === "pro";
}

/**
 * Check if a subscription is actually active based on status and period end
 */
export function isSubscriptionActive(
  subscriptionStatus: string | null,
  periodEnd: string | null
): boolean {
  if (
    !subscriptionStatus ||
    subscriptionStatus === "inactive" ||
    subscriptionStatus === "revoked"
  ) {
    return false;
  }

  // If there's a period end, check if it's in the future
  if (periodEnd) {
    const endDate = new Date(periodEnd);
    const now = new Date();
    return endDate > now;
  }

  // If status is active/canceled but no period end, consider it active
  return subscriptionStatus === "active" || subscriptionStatus === "canceled";
}

export function handleCreditError(creditError: any) {
  console.error("Failed to decrement credits:", creditError);

  if (
    creditError.message?.includes("Insufficient credits") ||
    creditError.code === "23514" ||
    (creditError.message?.includes("ERRCODE") &&
      creditError.message?.includes("23514"))
  ) {
    return errorResponse("Insufficient credits", 403);
  }
}
