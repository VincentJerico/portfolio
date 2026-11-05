import { describe, expect, it, vi } from 'vitest';
import { fetchRepoMeta } from '@/lib/github';

const URL_ = 'https://github.com/VincentJerico/accessibility-testing';
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function fetchOk(topics: unknown = ['playwright', 'qa']) {
  return vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes('/commits')
      ? json([{ commit: { committer: { date: '2026-11-02T09:15:00Z' } } }])
      : json({ topics, default_branch: 'main' }),
  );
}

describe('fetchRepoMeta', () => {
  it('parses last commit date and topics', async () => {
    const meta = await fetchRepoMeta(URL_, { fetchImpl: fetchOk() as unknown as typeof fetch });
    expect(meta).toEqual({ lastCommit: '2026-11-02', topics: ['playwright', 'qa'] });
  });

  it('requests both endpoints with the token', async () => {
    const fetchImpl = fetchOk();
    await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch, token: 't0k' });
    const calls = fetchImpl.mock.calls as unknown as [string, RequestInit & { next?: unknown }][];
    expect(calls.map(([u]) => u)).toEqual([
      'https://api.github.com/repos/VincentJerico/accessibility-testing',
      'https://api.github.com/repos/VincentJerico/accessibility-testing/commits?sha=main&per_page=1',
    ]);
    for (const [, init] of calls) {
      expect(init.headers).toMatchObject({
        Authorization: 'Bearer t0k',
        Accept: 'application/vnd.github+json',
      });
      expect(init.next).toEqual({ revalidate: 86400 });
    }
  });

  it('returns null on a non-200', async () => {
    const fetchImpl = vi.fn(async () => json({ message: 'rate limited' }, 403));
    expect(
      await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).toBeNull();
  });

  it('returns null on malformed JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('not json', { status: 200 }));
    expect(
      await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).toBeNull();
  });

  it('returns null when fetch rejects (timeout)', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    expect(
      await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).toBeNull();
  });

  it('drops topics that are not GitHub topic slugs', async () => {
    const meta = await fetchRepoMeta(URL_, {
      fetchImpl: fetchOk(['ok-topic', 'Bad Topic!']) as unknown as typeof fetch,
    });
    expect(meta?.topics).toEqual(['ok-topic']);
  });

  it('returns null for a non-GitHub repo URL', async () => {
    const fetchImpl = fetchOk();
    expect(
      await fetchRepoMeta('https://example.com/a/b', {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
