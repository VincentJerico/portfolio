import { z } from 'zod';

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string({ error: 'is required' })
    .trim()
    .pipe(
      z.url({
        protocol: /^https?$/,
        error: 'must be an absolute http(s) URL, e.g. https://example.dev',
      }),
    )
    .transform((value) => new URL(value).origin),
});

export type Env = z.infer<typeof EnvSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${problems}`);
  }
  return result.data;
}

let cached: Env | undefined;

// Parsed lazily so importing this module never throws; the literal
// process.env reference lets Next inline the value into client bundles.
export function getEnv(): Env {
  cached ??= parseEnv({ NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL });
  return cached;
}

export function siteUrl(path = '/', base = getEnv().NEXT_PUBLIC_SITE_URL): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return normalised === '/' ? base : `${base}${normalised}`;
}
