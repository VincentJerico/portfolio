import { describe, expect, it } from 'vitest';
import SelfTestPage from '@/app/selftest/page';

describe('self-test page', () => {
  it('does not exist in production builds (no E2E_SELFTEST)', () => {
    delete process.env.E2E_SELFTEST;
    expect(() => SelfTestPage()).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
  });
});
