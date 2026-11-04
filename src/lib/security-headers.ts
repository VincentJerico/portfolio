// Spec Section 10. One builder for next.config headers(); tests pin the literal spec values.

function csp(siteUrl: string): string {
  const directives = [
    "default-src 'self'",
    "img-src 'self' data: https://github.com https://img.shields.io https://avatars.githubusercontent.com",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "object-src 'none'",
  ];
  // Only on https origins: WebKit upgrades http://localhost requests to https and they fail,
  // leaving local and CI runs without CSS or JS (decision C20).
  if (siteUrl.startsWith('https://')) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function securityHeaders(siteUrl: string): Record<string, string> {
  return {
    'Content-Security-Policy': csp(siteUrl),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}
