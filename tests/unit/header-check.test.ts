import { describe, expect, it } from 'vitest';
import { headerDefects } from '@/lib/header-check';

const EXPECTED = {
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

describe('headerDefects (self-test: a non-compliant set must report each defect)', () => {
  it('reports every missing header', () => {
    expect(headerDefects({}, EXPECTED)).toEqual([
      'x-frame-options: missing',
      'referrer-policy: missing',
    ]);
  });

  it('reports a wrong value and wildcard CORS', () => {
    expect(
      headerDefects(
        {
          'x-frame-options': 'SAMEORIGIN',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'access-control-allow-origin': '*',
        },
        EXPECTED,
      ),
    ).toEqual([
      'x-frame-options: expected "DENY", got "SAMEORIGIN"',
      'access-control-allow-origin: * is set',
    ]);
  });

  it('passes a compliant set', () => {
    expect(headerDefects({ ...EXPECTED }, EXPECTED)).toEqual([]);
  });
});
