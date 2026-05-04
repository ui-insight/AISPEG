// Per-IP-hash rate limiter — Slice #113 of Epic #107.
//
// Sliding-window in memory. Acceptable for a single-instance deployment
// (the current dev / prod containers are one instance each). If the
// stack ever scales horizontally, swap this for a Postgres COUNT(*)
// against agent_queries — the index in Migration 009 covers exactly
// that query.

import "server-only";

const PUBLIC_LIMIT_PER_HOUR = 60;
const INTERNAL_LIMIT_PER_HOUR = 600;
const WINDOW_MS = 60 * 60 * 1000;

type Bucket = { stamps: number[] };
const buckets = new Map<string, Bucket>();

export interface RateCheck {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

function limitFor(audience: "public" | "internal"): number {
  return audience === "internal" ? INTERNAL_LIMIT_PER_HOUR : PUBLIC_LIMIT_PER_HOUR;
}

export function checkRate(
  ipHash: string,
  audience: "public" | "internal"
): RateCheck {
  const now = Date.now();
  const limit = limitFor(audience);
  const cutoff = now - WINDOW_MS;

  const key = `${audience}:${ipHash}`;
  const bucket = buckets.get(key) ?? { stamps: [] };
  // Drop stamps older than the window.
  const fresh = bucket.stamps.filter((t) => t >= cutoff);

  if (fresh.length >= limit) {
    const oldest = fresh[0]!;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + WINDOW_MS - now) / 1000)
    );
    buckets.set(key, { stamps: fresh });
    return { allowed: false, limit, remaining: 0, retryAfterSeconds };
  }

  fresh.push(now);
  buckets.set(key, { stamps: fresh });
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - fresh.length),
    retryAfterSeconds: 0,
  };
}

// Exposed for tests; resets the in-memory buckets.
export function resetRateLimiterForTesting(): void {
  buckets.clear();
}
