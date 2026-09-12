/**
 * In-Memory Sliding Window Rate Limiter
 *
 * ARCHITECTURAL NOTE ON HORIZONTAL SCALING:
 * This rate limiter stores client request timestamps in a local per-process JavaScript `Map`.
 * - In a single-instance container deployment (such as default CapRover or Docker), this is lightweight,
 *   fast, and requires no external infrastructure.
 * - If the application is ever scaled horizontally across multiple instances (e.g. multi-container cluster,
 *   Kubernetes pods, or serverless functions), memory is NOT shared between processes. An IP hitting different
 *   instances will have separate rate-limit budgets.
 * - Before running multiple instances in production, replace or back this state store with a centralized,
 *   distributed database/cache such as Redis (e.g. Upstash Redis, Redis with `@upstash/ratelimit`, or `ioredis`).
 */

const MAX_ENTRIES = 10_000; // Hard cap to prevent unbounded memory growth
const rateLimitMap = new Map();

/**
 * Basic IP-based sliding window rate limiter.
 * @param {string} ip - Client IP address
 * @param {number} limit - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if allowed, false if rate limited
 */
export function rateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    // Enforce hard cap: prune oldest entries if we're at the limit
    if (rateLimitMap.size >= MAX_ENTRIES) {
      const firstKey = rateLimitMap.keys().next().value;
      rateLimitMap.delete(firstKey);
    }
    rateLimitMap.set(ip, []);
  }

  let timestamps = rateLimitMap.get(ip);
  // Filter out expired timestamps
  timestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
  
  if (timestamps.length >= limit) {
    rateLimitMap.set(ip, timestamps);
    return false; // Rate limit exceeded
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true; // Allowed
}

// Clean up expired IP entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitMap.entries()) {
      const active = timestamps.filter(timestamp => now - timestamp < 600000); // 10 minutes max window
      if (active.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, active);
      }
    }
  }, 300000);
  if (timer && typeof timer.unref === 'function') {
    timer.unref();
  }
}
