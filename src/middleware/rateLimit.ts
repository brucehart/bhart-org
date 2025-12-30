/**
 * Simple in-memory rate limiter using sliding window algorithm
 */

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
}

/**
 * Get client identifier from request
 */
const getClientId = (request: Request): string => {
  // Try CF-Connecting-IP first (Cloudflare header)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  // Fall back to X-Forwarded-For
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Default fallback
  return 'unknown';
};

/**
 * Check if request is rate limited
 * @returns null if allowed, Response with 429 status if rate limited
 */
export const checkRateLimit = (
  request: Request,
  config: RateLimitConfig,
): Response | null => {
  const clientId = getClientId(request);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(clientId);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(clientId, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= config.maxRequests) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'rate_limit_exceeded',
          message: 'Too many requests. Please try again later.',
        },
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': Math.ceil(config.windowMs / 1000).toString(),
        },
      },
    );
  }

  // Add current timestamp
  entry.timestamps.push(now);

  return null;
};

/**
 * Clean up old entries periodically (optional, for memory management)
 */
export const cleanupRateLimitStore = (maxAge: number) => {
  const cutoff = Date.now() - maxAge;
  for (const [clientId, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(clientId);
    }
  }
};
