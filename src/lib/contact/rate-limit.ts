import { createHmac } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimiter {
  /** Resolves true when the request is allowed. */
  limit(key: string): Promise<boolean>;
}

export function upstashLimiter(url: string, token: string): RateLimiter {
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'contact',
  });
  return {
    async limit(key) {
      const { success } = await ratelimit.limit(key);
      return success;
    },
  };
}

/** Wraps a limiter so it only ever sees an HMAC-SHA256 of the client key, never the raw IP. */
export function hashedLimiter(inner: RateLimiter, secret: string): RateLimiter {
  return {
    limit: (key) => inner.limit(createHmac('sha256', secret).update(key).digest('hex')),
  };
}

export function memoryLimiter(max = 5, windowMs = 600_000): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}
