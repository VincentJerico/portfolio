import { afterEach, describe, expect, it, vi } from 'vitest';
import { contactConfig } from '@/lib/contact/config';
import { resendMailer, testMailer, type Mailer } from '@/lib/contact/mailer';
import { memoryLimiter, type RateLimiter } from '@/lib/contact/rate-limit';
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

  it('rate-limited after the limiter refuses', async () => {
    const deps = fakes(false);
    expect(await submitContact(form(VALID), 'k', deps)).toEqual({ status: 'rate-limited' });
    expect(deps.mailer.send).not.toHaveBeenCalled();
  });

  it('mailer failure reports failed and does not throw', async () => {
    const deps = fakes();
    deps.mailer.send = vi.fn(async () => {
      throw new Error('boom');
    });
    await expect(submitContact(form(VALID), 'k', deps)).resolves.toEqual({ status: 'failed' });
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

describe('contactConfig', () => {
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

  it('resendMailer throws on a 4xx', async () => {
    const fetchImpl = vi.fn(async () => new Response('no', { status: 422 }));
    await expect(
      resendMailer('k', 't@example.com', fetchImpl as unknown as typeof fetch).send(msg),
    ).rejects.toThrow();
  });

  it('testMailer throws only for the failure marker', async () => {
    await expect(testMailer().send(msg)).resolves.toBeUndefined();
    await expect(
      testMailer().send({ ...msg, message: 'e2e-mailer-failure now' }),
    ).rejects.toThrow();
  });
});
