import type { RateLimitEntry, RateLimitStorage } from "./types";

const CLEANUP_INTERVAL_MS = 60000;

class InMemoryStorage implements RateLimitStorage {
  private readonly store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeCleanup();
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      const windowStart = now - entry.windowMs;
      const filtered = this.filterValidTimestamps(
        entry.timestamps,
        windowStart
      );

      if (filtered.length === 0) {
        expiredKeys.push(key);
      } else if (filtered.length < entry.timestamps.length) {
        entry.timestamps = filtered;
      }
    }

    for (const key of expiredKeys) {
      this.store.delete(key);
    }
  }

  private initializeCleanup(): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      CLEANUP_INTERVAL_MS
    );
  }

  private filterValidTimestamps(
    timestamps: number[],
    windowStart: number
  ): number[] {
    const valid: number[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] > windowStart) {
        valid.push(timestamps[i]);
      }
    }
    return valid;
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

let globalStorage: InMemoryStorage | null = null;

export function getStorage(): RateLimitStorage {
  return (globalStorage ??= new InMemoryStorage());
}
