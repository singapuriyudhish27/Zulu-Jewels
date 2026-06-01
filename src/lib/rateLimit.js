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
  setInterval(() => {
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
}
