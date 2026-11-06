import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { fetchRepoMeta, parseRepo } from '@/lib/github';
import { projectsInOrder } from '@/lib/content';

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
  let warn: MockInstance<typeof console.warn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

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

  it('returns null on a non-200 and warns with the status and repository URL only', async () => {
    const fetchImpl = vi.fn(async () => json({ message: 'rate limited' }, 403));
    expect(
      await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch, token: 't0k' }),
    ).toBeNull();
    expect(warn.mock.calls).toEqual([[`github: ${URL_} responded 403`]]);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('t0k');
  });

  it('retries once without the token after a 401', async () => {
    const ok = fetchOk();
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      (init?.headers as Record<string, string>).Authorization
        ? json({ message: 'Bad credentials' }, 401)
        : ok(input),
    );
    const meta = await fetchRepoMeta(URL_, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      token: 'expired',
    });
    expect(meta).toEqual({ lastCommit: '2026-11-02', topics: ['playwright', 'qa'] });
    const auth = (fetchImpl.mock.calls as unknown as [string, RequestInit][]).map(
      ([, init]) => (init.headers as Record<string, string>).Authorization,
    );
    // Repository: with the token (401), then without; commits: without.
    expect(auth).toEqual(['Bearer expired', undefined, undefined]);
    expect(warn.mock.calls).toEqual([[`github: ${URL_} responded 401`]]);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('expired');
  });

  it('does not retry a 401 without a token', async () => {
    const fetchImpl = vi.fn(async () => json({ message: 'Requires authentication' }, 401));
    expect(
      await fetchRepoMeta(URL_, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
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

describe('parseRepo', () => {
  it('parses every project repository URL', () => {
    const repos = projectsInOrder().flatMap((p) => (p.repo ? [p.repo] : []));
    expect(repos.length).toBeGreaterThan(0);
    expect(repos.filter((repo) => parseRepo(repo) === null)).toEqual([]);
  });
});
