import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, headers?: HeadersInit) {
  return NextResponse.json(data, { headers });
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
  defaultCredits: number = 500
) {
  const { data: usage, error } = await supabase
    .from("usage")
    .select("credits, plan, monthly_credits_limit, last_reset")
    .eq("user_id", userId)
    .single();

  if (error?.code === "PGRST116") {
    const { data: newUsage, error: insertError } = await supabase
      .from("usage")
      .insert({
        user_id: userId,
        credits: defaultCredits,
        plan: "free",
        monthly_credits_limit: 500
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newUsage;
  }

  if (error) throw error;
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
