import type { RateLimitConfig } from "./types";

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/chat": {
    free: 10,
    pro: 60,
    windowMs: 60000,
  },
  "/api/notes:POST": {
    free: 20,
    pro: 100,
    windowMs: 60000,
  },
  "/api/notes:GET": {
    free: 60,
    pro: 300,
    windowMs: 60000,
  },
  "/api/notes/search": {
    free: 15,
    pro: 80,
    windowMs: 60000,
  },
  "/api/analytics/thinking-patterns": {
    free: 5,
    pro: 30,
    windowMs: 60000,
  },
  "/api/collections:POST": {
    free: 30,
    pro: 120,
    windowMs: 60000,
  },
  "/api/collections:GET": {
    free: 60,
    pro: 300,
    windowMs: 60000,
  },
  "/api/notes/bulk": {
    free: 5,
    pro: 20,
    windowMs: 60000,
  },
  "/api/subscriptions/checkout": {
    free: 3,
    pro: 10,
    windowMs: 60000,
  },
};

export function getRateLimitConfig(
  endpoint: string,
  method?: string
): RateLimitConfig | null {
  if (method) {
    const methodKey = `${endpoint}:${method}`;
    const config = RATE_LIMIT_CONFIGS[methodKey];
    if (config) return config;
  }

  return RATE_LIMIT_CONFIGS[endpoint] ?? null;
}
