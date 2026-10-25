import { describe, expect, it } from 'vitest';
import { securityHeaders } from '@/lib/security-headers';

// The spec Section 10 CSP, written out literally so a weakened policy fails here.
const SPEC_CSP =
  "default-src 'self'; img-src 'self' data: https://github.com https://img.shields.io https://avatars.githubusercontent.com; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests";

describe('securityHeaders', () => {
  it('sends the exact spec CSP on an https site', () => {
    expect(securityHeaders('https://vincentjerico.dev')['Content-Security-Policy']).toBe(SPEC_CSP);
  });

  it('drops upgrade-insecure-requests on plain-http origins (WebKit upgrades localhost and fails)', () => {
    expect(securityHeaders('http://localhost:3210')['Content-Security-Policy']).toBe(
      SPEC_CSP.replace('; upgrade-insecure-requests', ''),
    );
  });

  it('sends the other spec headers verbatim', () => {
    expect(securityHeaders('https://vincentjerico.dev')).toMatchObject({
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
  });
});
