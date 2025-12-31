/**
 * Durable Object-backed rate limiter using a sliding window.
 */

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
export const getRateLimitClientId = (request: Request, includeUserAgent = false): string => {
  // Try CF-Connecting-IP first (Cloudflare header)
  const cfIp = request.headers.get('cf-connecting-ip');
  let ip = cfIp ?? '';
  if (!ip) {
    // Fall back to X-Forwarded-For
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    }
  }
  if (!ip) {
    ip = 'unknown';
  }
  if (!includeUserAgent) {
    return ip;
  }
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  return `${ip}|${userAgent}`;
};

/**
 * Check if request is rate limited
 * @returns null if allowed, Response with 429 status if rate limited
 */
export const checkRateLimit = async (
  request: Request,
  env: Env,
  config: RateLimitConfig,
  clientIdOverride?: string,
): Promise<Response | null> => {
  const clientId = clientIdOverride ?? getRateLimitClientId(request);
  const limiterId = env.RATE_LIMITER.idFromName(clientId);
  const limiter = env.RATE_LIMITER.get(limiterId);
  const response = await limiter.fetch('https://rate-limit/check', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (response.status === 429) {
    return response;
  }
  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'rate_limit_error',
          message: 'Rate limiter unavailable.',
        },
      }),
      {
        status: 503,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
  return null;
};

export class RateLimiter {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let payload: { windowMs?: number; maxRequests?: number } | null = null;
    try {
      payload = (await request.json()) as { windowMs?: number; maxRequests?: number };
    } catch {
      payload = null;
    }

    const windowMs = payload?.windowMs;
    const maxRequests = payload?.maxRequests;
    if (!windowMs || !maxRequests) {
      return new Response('Bad Request', { status: 400 });
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (await this.state.storage.get<number[]>('timestamps')) ?? [];
    const filtered = timestamps.filter((ts) => ts > windowStart);

    if (filtered.length >= maxRequests) {
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
            'retry-after': Math.ceil(windowMs / 1000).toString(),
          },
        },
      );
    }

    filtered.push(now);
    await this.state.storage.put('timestamps', filtered);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
