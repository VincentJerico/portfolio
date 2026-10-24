import { describe, expect, it } from 'vitest';
import { parseEnv, siteUrl } from '@/lib/env';

describe('parseEnv', () => {
  it('throws naming the variable when it is missing', () => {
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('throws naming the variable when it is not a URL', () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: 'not a url' })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it.each(['localhost:3000', 'vincentjerico.dev:443', 'javascript:alert(1)', 'ftp://x.dev'])(
    'rejects %s because it is not an http(s) URL',
    (value) => {
      expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: value })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    },
  );

  it('normalises surrounding whitespace and a trailing slash', () => {
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: ' https://example.dev/ ' }).NEXT_PUBLIC_SITE_URL).toBe(
      'https://example.dev',
    );
  });
});

describe('siteUrl', () => {
  it('builds absolute URLs without double slashes', () => {
    expect(siteUrl('/projects', 'https://example.dev')).toBe('https://example.dev/projects');
  });

  it('returns the bare origin for the root path', () => {
    expect(siteUrl('/', 'https://example.dev')).toBe('https://example.dev');
  });
});
