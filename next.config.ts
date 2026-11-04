import type { NextConfig } from 'next';
import { getEnv } from './src/lib/env';
import { securityHeaders } from './src/lib/security-headers';

// Fail the build early, with a clear message, when NEXT_PUBLIC_SITE_URL is missing or invalid.
getEnv();

// cacheComponents stays off: it keeps visited routes mounted but hidden, which breaks
// "exactly one <h1>" checks, axe scans and the in-browser runner (docs/04-DECISIONS.md).
const nextConfig: NextConfig = {
  // Spec Section 10, on every route. CSP keeps 'unsafe-inline' for scripts: Next streams its RSC
  // payload in inline scripts and the theme script runs inline; nonces would force every page to be
  // rendered per request instead of statically (decision C19).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: Object.entries(securityHeaders(getEnv().NEXT_PUBLIC_SITE_URL)).map(
          ([key, value]) => ({ key, value }),
        ),
      },
    ];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
