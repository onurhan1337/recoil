export type UserPlan = "free" | "pro";

export interface RateLimitConfig {
  free: number;
  pro: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitEntry {
  timestamps: number[];
  limit: number;
  windowMs: number;
}

export interface RateLimitStorage {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
  cleanup(): void;
}

export interface RateLimitIdentifier {
  userId?: string;
  ip?: string;
}

export interface RateLimitContext {
  identifier: RateLimitIdentifier;
  endpoint: string;
  plan: UserPlan;
}
