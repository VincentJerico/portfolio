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

function secrets(env: Record<string, string | undefined>) {
  return {
    apiKey: env.RESEND_API_KEY,
    to: env.CONTACT_TO_EMAIL,
    url: env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN,
  };
}

/**
 * Whether the form should render. Presence only, so it is safe at build time: our CI build pulls the
 * Vercel env, where Sensitive variables (the Upstash integration's) arrive as placeholders, while the
 * deployed functions receive the real values at runtime.
 */
export function isContactConfigured(env: Record<string, string | undefined> = process.env): boolean {
  if (isTestBuild(env)) return true;
  const { apiKey, to, url, token } = secrets(env);
  return Boolean(apiKey && to && url && token);
}

// Called at request time. Never throws: missing or invalid secrets yield null (the form reports a failure).
export function contactConfig(
  env: Record<string, string | undefined> = process.env,
): ContactDeps | null {
  if (isTestBuild(env)) return { limiter: memoryLimiter(), mailer: testMailer() };

  const { apiKey, to, url, token } = secrets(env);
  if (!apiKey || !to || !url || !token) return null;

  try {
    return {
      limiter: hashedLimiter(upstashLimiter(url, token), limiterKeySecret(env, token)),
      mailer: resendMailer(apiKey, to),
    };
  } catch {
    console.error('contact: invalid configuration');
    return null;
  }
}
