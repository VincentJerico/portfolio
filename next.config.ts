import type { NextConfig } from 'next';
import { getEnv } from './src/lib/env';

// Fail the build early, with a clear message, when NEXT_PUBLIC_SITE_URL is missing or invalid.
getEnv();

// cacheComponents stays off: it keeps visited routes mounted but hidden, which breaks
// "exactly one <h1>" checks, axe scans and the in-browser runner (docs/04-DECISIONS.md).
const nextConfig: NextConfig = {
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
