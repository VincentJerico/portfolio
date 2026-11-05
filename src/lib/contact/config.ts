import { resendMailer, testMailer, type Mailer } from './mailer';
import { memoryLimiter, upstashLimiter, type RateLimiter } from './rate-limit';

export interface ContactDeps {
  limiter: RateLimiter;
  mailer: Mailer;
}

export function isTestBuild(env: Record<string, string | undefined> = process.env): boolean {
  return env.E2E_SELFTEST === '1';
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

  return { limiter: upstashLimiter(url, token), mailer: resendMailer(apiKey, to) };
}
