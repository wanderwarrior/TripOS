// Lightweight fixed-window rate limiter.
//
// IMPORTANT: this store is IN-MEMORY and PER-INSTANCE. It's a good, zero-
// dependency defence against bursts/abuse on a single server or a warm
// serverless instance — but it does NOT share state across instances. For
// multi-instance / serverless-at-scale production, swap the `store` for
// Upstash Redis (the function signatures can stay identical). Treat this as a
// floor, not a guarantee.

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of store) {
    if (b.resetAt <= now) store.delete(k);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Seconds until the window resets (0 when allowed). */
  retryAfter: number;
};

/**
 * Allow up to `limit` hits per `windowMs` for a given `key`.
 * Returns `{ ok: false, retryAfter }` once the window is exhausted.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function clientIpFrom(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
