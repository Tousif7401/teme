/**
 * Edge-compatible rate limiter using token bucket algorithm.
 *
 * NOTE: This is an in-memory implementation suitable for:
 * - Development environments
 * - Low-to-medium traffic deployments
 * - DDoS mitigation (makes abuse expensive)
 *
 * For high-traffic production, consider Upstash Redis or Cloudflare KV.
 */

interface TokenBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, TokenBucket>()

interface RateLimitConfig {
  /** Rate limit window in milliseconds */
  interval: number
  /** Maximum requests per window */
  limit: number
  /** Refill rate (tokens per second) - for token bucket algorithm */
  refillRate?: number
}

/**
 * Check if a request should be rate limited using token bucket algorithm.
 * Returns true if allowed, false if rate limited.
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, limit, refillRate } = config
  // Default refill rate: replenish full bucket over the interval
  const tokensPerSecond = refillRate || (limit / (interval / 1000))

  return (identifier: string): boolean => {
    const now = Date.now()
    const bucket = buckets.get(identifier)

    if (!bucket) {
      // First request - create new bucket
      buckets.set(identifier, {
        tokens: limit - 1, // Consume 1 token
        lastRefill: now,
      })
      return true
    }

    // Calculate time passed and refill tokens
    const timePassed = (now - bucket.lastRefill) / 1000 // seconds
    const tokensToAdd = timePassed * tokensPerSecond
    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now

    // Check if we have tokens
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      buckets.set(identifier, bucket)
      return true
    }

    // Rate limited
    return false
  }
}

/**
 * Cleanup old buckets to prevent memory leaks.
 * Run periodically in the background.
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
const BUCKET_TTL = 15 * 60 * 1000 // 15 minutes of inactivity = delete

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.lastRefill > BUCKET_TTL) {
        buckets.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Get current rate limit status for a user (useful for showing headers).
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number
  reset: number
} | null {
  const bucket = buckets.get(identifier)
  if (!bucket) return null

  return {
    remaining: Math.max(0, Math.floor(bucket.tokens)),
    reset: bucket.lastRefill + CLEANUP_INTERVAL,
  }
}
