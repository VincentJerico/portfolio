import type { NextConfig } from 'next';

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
