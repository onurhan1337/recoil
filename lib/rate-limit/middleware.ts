import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitContext, UserPlan } from "./types";
import { isProPlan } from "@/lib/api/utils";

const IP_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
] as const;

function extractClientIP(request: NextRequest): string {
  for (const headerName of IP_HEADERS) {
    const value = request.headers.get(headerName);
    if (value) {
      return headerName === "x-forwarded-for"
        ? value.split(",")[0].trim()
        : value;
    }
  }
  return "unknown";
}

async function fetchUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<UserPlan> {
  const { data: usage } = await supabase
    .from("usage")
    .select("plan")
    .eq("user_id", userId)
    .single();

  return isProPlan(usage?.plan) ? "pro" : "free";
}

export async function createRateLimitContext(
  request: NextRequest,
  endpoint: string,
  supabase?: SupabaseClient,
  userId?: string
): Promise<RateLimitContext> {
  if (userId && supabase) {
    const plan = await fetchUserPlan(supabase, userId);
    return {
      identifier: { userId },
      endpoint,
      plan,
    };
  }

  return {
    identifier: { ip: extractClientIP(request) },
    endpoint,
    plan: "free",
  };
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function createRateLimitResponse(
  result: RateLimitResult,
  message = "Too many requests"
): NextResponse {
  const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
  const headers = new Headers({
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": String(retryAfter),
  });

  if (!result.allowed) {
    return NextResponse.json({ error: message }, { status: 429, headers });
  }

  return NextResponse.next({ headers });
}
