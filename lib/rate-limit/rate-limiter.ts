import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitEntry,
  RateLimitContext,
} from "./types";
import { getStorage } from "./storage";

function buildStorageKey(context: RateLimitContext): string {
  const identifier =
    context.identifier.userId ?? context.identifier.ip ?? "anonymous";
  return `${identifier}:${context.endpoint}:${context.plan}`;
}

function resolveLimit(config: RateLimitConfig, plan: string): number {
  return plan === "pro" ? config.pro : config.free;
}

function filterExpiredTimestamps(
  timestamps: number[],
  windowStart: number
): number[] {
  const valid: number[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    if (ts > windowStart) valid.push(ts);
  }
  return valid;
}

function findOldestTimestamp(timestamps: number[]): number | null {
  if (timestamps.length === 0) return null;
  let oldest = timestamps[0];
  for (let i = 1; i < timestamps.length; i++) {
    const ts = timestamps[i];
    if (ts < oldest) oldest = ts;
  }
  return oldest;
}

function calculateResetTime(
  timestamps: number[],
  windowMs: number,
  fallback: number
): number {
  const oldest = findOldestTimestamp(timestamps);
  return (oldest ?? fallback) + windowMs;
}

export function checkRateLimit(
  context: RateLimitContext,
  config: RateLimitConfig
): RateLimitResult {
  const storage = getStorage();
  const key = buildStorageKey(context);
  const limit = resolveLimit(config, context.plan);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const existingEntry = storage.get(key);
  const entry: RateLimitEntry = existingEntry ?? {
    timestamps: [],
    limit,
    windowMs: config.windowMs,
  };

  entry.limit = limit;
  entry.windowMs = config.windowMs;

  const validTimestamps = filterExpiredTimestamps(
    entry.timestamps,
    windowStart
  );
  entry.timestamps = validTimestamps;

  const currentCount = validTimestamps.length;
  const allowed = currentCount < limit;

  if (allowed) {
    entry.timestamps.push(now);
  }

  storage.set(key, entry);

  const reset = calculateResetTime(validTimestamps, config.windowMs, now);
  const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));

  return {
    allowed,
    limit,
    remaining,
    reset,
  };
}
