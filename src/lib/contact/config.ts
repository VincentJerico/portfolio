import { createHash } from 'node:crypto';
import { resendMailer, testMailer, type Mailer } from './mailer';
import { hashedLimiter, memoryLimiter, upstashLimiter, type RateLimiter } from './rate-limit';

export interface ContactDeps {
  limiter: RateLimiter;
  mailer: Mailer;
}

// Defence in depth: a Vercel build or runtime (VERCEL_ENV is always set there) never gets the stand-ins,
// even if E2E_SELFTEST leaks into the project's environment.
export function isTestBuild(env: Record<string, string | undefined> = process.env): boolean {
  return env.E2E_SELFTEST === '1' && !env.VERCEL_ENV;
}

/** The HMAC key for rate-limit keys: CONTACT_KEY_SALT when set, else derived from the Redis token. */
export function limiterKeySecret(env: Record<string, string | undefined>, token: string): string {
  return env.CONTACT_KEY_SALT || createHash('sha256').update(`contact-key:${token}`).digest('hex');
}

// Never throws: a build or deploy without secrets just yields null.
export function contactConfig(
  env: Record<string, string | undefined> = process.env,
): ContactDeps | null {
  if (isTestBuild(env)) return { limiter: memoryLimiter(), mailer: testMailer() };

  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!apiKey || !to || !url || !token) return null;

  return {
    limiter: hashedLimiter(upstashLimiter(url, token), limiterKeySecret(env, token)),
    mailer: resendMailer(apiKey, to),
  };
}
