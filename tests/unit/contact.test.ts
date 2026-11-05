import { afterEach, describe, expect, it, vi } from 'vitest';
import { clientKeyFrom } from '@/lib/contact/client-key';
import { contactConfig, isTestBuild, limiterKeySecret } from '@/lib/contact/config';
import { MailError, resendMailer, testMailer, type Mailer } from '@/lib/contact/mailer';
import { hashedLimiter, memoryLimiter, type RateLimiter } from '@/lib/contact/rate-limit';
import { submitContact } from '@/lib/contact/submit';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = {
  name: '  Ada Lovelace ',
  email: 'ada@example.com',
  message: '  Hello, this is a long enough message.  ',
};

function fakes(allowed = true) {
  const limiter: RateLimiter = { limit: vi.fn(async () => allowed) };
  const mailer: Mailer = { send: vi.fn(async () => undefined) };
  return { limiter, mailer };
}

describe('submitContact', () => {
  it('rejects empty and malformed fields with a message per field', async () => {
    const deps = fakes();
    const state = await submitContact(
      form({ name: ' ', email: 'nope', message: 'short' }),
      'k',
      deps,
    );
    expect(state).toEqual({
      status: 'invalid',
      fieldErrors: {
        name: 'Enter your name.',
        email: 'Enter a valid email address.',
        message: 'Write at least 10 characters.',
      },
      values: { name: ' ', email: 'nope', message: 'short' },
    });
    expect(deps.mailer.send).not.toHaveBeenCalled();
  });

  it('flags a message that is too long', async () => {
    const state = await submitContact(form({ ...VALID, message: 'x'.repeat(5001) }), 'k', fakes());
    expect(state).toMatchObject({
      status: 'invalid',
      fieldErrors: { message: 'Keep it under 5,000 characters.' },
    });
  });

  it('honeypot filled: reports sent, sends nothing, does not count against the limit', async () => {
    const deps = fakes();
    const state = await submitContact(form({ ...VALID, website: 'http://spam' }), 'k', deps);
    expect(state).toEqual({ status: 'sent' });
    expect(deps.mailer.send).not.toHaveBeenCalled();
    expect(deps.limiter.limit).not.toHaveBeenCalled();
  });

  it('sends once and reports sent for valid input', async () => {
    const deps = fakes();
    const state = await submitContact(form(VALID), 'k', deps);
    expect(state).toEqual({ status: 'sent' });
    expect(deps.mailer.send).toHaveBeenCalledTimes(1);
    expect(deps.mailer.send).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, this is a long enough message.',
    });
  });

  it('rate-limited after the limiter refuses, handing back what was typed', async () => {
    const deps = fakes(false);
    expect(await submitContact(form(VALID), 'k', deps)).toEqual({
      status: 'rate-limited',
      values: VALID,
    });
    expect(deps.mailer.send).not.toHaveBeenCalled();
  });

  it('a limiter error reports failed and never logs its message (it can embed the IP)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const deps = fakes();
      deps.limiter = {
        limit: vi.fn(async () => {
          throw new Error('Command failed: ["EVALSHA","x","1","contact:203.0.113.7:abc"]');
        }),
      };
      await expect(submitContact(form(VALID), '203.0.113.7', deps)).resolves.toEqual({
        status: 'failed',
        values: VALID,
      });
      expect(deps.mailer.send).not.toHaveBeenCalled();
      expect(spy.mock.calls).toEqual([['contact: delivery failed', 'rate-limit']]);
      expect(JSON.stringify(spy.mock.calls)).not.toContain('203.0.113.7');
    } finally {
      spy.mockRestore();
    }
  });

  it('an unexpected mailer error logs a fixed classification only', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const deps = fakes();
      deps.mailer = {
        send: vi.fn(async () => {
          throw new Error('socket hang up for ada@example.com');
        }),
      };
      await expect(submitContact(form(VALID), 'k', deps)).resolves.toEqual({
        status: 'failed',
        values: VALID,
      });
      expect(spy.mock.calls).toEqual([['contact: delivery failed', 'unknown']]);
    } finally {
      spy.mockRestore();
    }
  });

  it('mailer failure reports failed, does not throw, and logs without personal data', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const deps = fakes();
      deps.mailer = resendMailer(
        'secret-key',
        'me@example.com',
        (async () =>
          new Response('bad ada@example.com', { status: 422 })) as unknown as typeof fetch,
      );
      await expect(submitContact(form(VALID), '203.0.113.9', deps)).resolves.toEqual({
        status: 'failed',
        values: VALID,
      });
      expect(spy.mock.calls).toEqual([['contact: delivery failed', 'mail 422']]);
      const logged = JSON.stringify(spy.mock.calls);
      for (const secret of [
        'ada@example.com',
        'Ada Lovelace',
        'long enough message',
        '203.0.113.9',
        'secret-key',
        'me@example.com',
      ]) {
        expect(logged).not.toContain(secret);
      }
    } finally {
      spy.mockRestore();
    }
  });
});

describe('memoryLimiter', () => {
  afterEach(() => vi.useRealTimers());

  it('allows 5 then refuses the 6th within the window, per key', async () => {
    vi.useFakeTimers();
    const limiter = memoryLimiter();
    for (let i = 0; i < 5; i += 1) expect(await limiter.limit('a')).toBe(true);
    expect(await limiter.limit('a')).toBe(false);
    expect(await limiter.limit('b')).toBe(true);
    vi.advanceTimersByTime(600_001);
    expect(await limiter.limit('a')).toBe(true);
  });
});

describe('clientKeyFrom', () => {
  const headers = (entries: Record<string, string>) => new Headers(entries);

  it('takes the first X-Forwarded-For entry, trimmed', () => {
    expect(
      clientKeyFrom(
        headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1', 'x-real-ip': '1.1.1.1' }),
        false,
      ),
    ).toBe('203.0.113.7');
  });

  it('falls back to X-Real-IP, then to unknown', () => {
    expect(clientKeyFrom(headers({ 'x-real-ip': '198.51.100.4' }), false)).toBe('198.51.100.4');
    expect(clientKeyFrom(headers({ 'x-forwarded-for': ' , ' }), false)).toBe('unknown');
    expect(clientKeyFrom(headers({}), false)).toBe('unknown');
  });

  it('appends the e2e client header only in the test build', () => {
    const h = headers({ 'x-forwarded-for': '203.0.113.7', 'x-e2e-client': 'run-1' });
    expect(clientKeyFrom(h, true)).toBe('203.0.113.7:run-1');
    expect(clientKeyFrom(h, false)).toBe('203.0.113.7');
    expect(clientKeyFrom(headers({}), true)).toBe('unknown:');
  });
});

describe('hashedLimiter', () => {
  it('passes an HMAC of the key, never the raw IP, and keeps keys apart', async () => {
    const seen: string[] = [];
    const inner: RateLimiter = {
      limit: async (key) => {
        seen.push(key);
        return true;
      },
    };
    const limiter = hashedLimiter(inner, 'salt-a');
    await limiter.limit('203.0.113.7');
    await limiter.limit('203.0.113.7');
    await limiter.limit('203.0.113.8');
    await hashedLimiter(inner, 'salt-b').limit('203.0.113.7');
    for (const key of seen) {
      expect(key).toMatch(/^[0-9a-f]{64}$/);
      expect(key).not.toContain('203.0.113');
    }
    expect(seen[0]).toBe(seen[1]);
    expect(new Set([seen[0], seen[2], seen[3]]).size).toBe(3);
  });

  it('is keyed by CONTACT_KEY_SALT when set, else by a secret derived from the token', () => {
    expect(limiterKeySecret({ CONTACT_KEY_SALT: 'my-salt' }, 'tok')).toBe('my-salt');
    const derived = limiterKeySecret({}, 'tok');
    expect(derived).toMatch(/^[0-9a-f]{64}$/);
    expect(derived).not.toContain('tok');
    expect(limiterKeySecret({}, 'tok')).toBe(derived);
    expect(limiterKeySecret({}, 'other')).not.toBe(derived);
  });
});

describe('contactConfig', () => {
  it('never uses the stand-ins on Vercel, even with E2E_SELFTEST set', () => {
    expect(isTestBuild({ E2E_SELFTEST: '1' })).toBe(true);
    expect(isTestBuild({ E2E_SELFTEST: '1', VERCEL_ENV: 'production' })).toBe(false);
    expect(isTestBuild({ E2E_SELFTEST: '1', VERCEL_ENV: 'preview' })).toBe(false);
    expect(contactConfig({ E2E_SELFTEST: '1', VERCEL_ENV: 'production' })).toBeNull();
  });

  it('returns null without the secrets and stand-ins in the test build', () => {
    expect(contactConfig({})).toBeNull();
    expect(contactConfig({ RESEND_API_KEY: 'k', CONTACT_TO_EMAIL: 'a@b.c' })).toBeNull();
    expect(contactConfig({ E2E_SELFTEST: '1' })).not.toBeNull();
    expect(
      contactConfig({
        RESEND_API_KEY: 'k',
        CONTACT_TO_EMAIL: 'a@b.c',
        KV_REST_API_URL: 'https://x.upstash.io',
        KV_REST_API_TOKEN: 't',
      }),
    ).not.toBeNull();
  });
});

describe('mailers', () => {
  const msg = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, friend.' };

  it('resendMailer posts the expected request', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }));
    await resendMailer('key-1', 'me@example.com', fetchImpl as unknown as typeof fetch).send(msg);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer key-1');
    expect(JSON.parse(init.body as string)).toEqual({
      from: 'Portfolio contact <onboarding@resend.dev>',
      to: 'me@example.com',
      reply_to: 'ada@example.com',
      subject: 'Portfolio contact from Ada',
      text: expect.stringContaining('Hello there, friend.'),
    });
  });

  it('resendMailer gives up after a timeout', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }));
    await resendMailer('key-1', 'me@example.com', fetchImpl as unknown as typeof fetch).send(msg);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('resendMailer throws a MailError carrying the status on a 4xx', async () => {
    const fetchImpl = vi.fn(async () => new Response('no', { status: 422 }));
    const sent = resendMailer('k', 't@example.com', fetchImpl as unknown as typeof fetch).send(msg);
    await expect(sent).rejects.toBeInstanceOf(MailError);
    await expect(sent).rejects.toMatchObject({ status: 422 });
  });

  it('testMailer throws only for the failure marker', async () => {
    await expect(testMailer().send(msg)).resolves.toBeUndefined();
    await expect(
      testMailer().send({ ...msg, message: 'e2e-mailer-failure now' }),
    ).rejects.toThrow();
  });
});
