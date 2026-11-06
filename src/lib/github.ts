import { z } from 'zod';
import { githubFixture } from '@/lib/github-fixture';

export type RepoMeta = { lastCommit: string; topics: string[] };

const REVALIDATE = 86400;
const TOPIC = /^[a-z0-9][a-z0-9-]{0,49}$/;

const repoBody = z.object({
  topics: z.array(z.string()).default([]),
  default_branch: z.string().min(1),
});
const commitsBody = z
  .array(z.object({ commit: z.object({ committer: z.object({ date: z.iso.datetime() }) }) }))
  .min(1);

/** Owner and name of a `https://github.com/<owner>/<name>` URL, or null for anything else. */
export function parseRepo(url: string): { owner: string; name: string } | null {
  const match = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/.exec(url);
  return match ? { owner: match[1]!, name: match[2]! } : null;
}

/**
 * Last commit date and topics of a public repository. Any failure returns null, so a failed refresh
 * shows no GitHub fields instead of failing the page.
 */
export async function fetchRepoMeta(
  repoUrl: string,
  opts: { fetchImpl?: typeof fetch; token?: string } = {},
): Promise<RepoMeta | null> {
  const repo = parseRepo(repoUrl);
  if (!repo) return null;
  const { fetchImpl = fetch } = opts;
  let token = opts.token;
  const base = `https://api.github.com/repos/${repo.owner}/${repo.name}`;
  const request = (url: string) =>
    fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: REVALIDATE },
    });
  const get = async (url: string): Promise<unknown> => {
    let res = await request(url);
    if (res.status === 401 && token) {
      // A revoked or expired token: warn, then carry on unauthenticated (public repositories).
      console.warn(`github: ${repoUrl} responded 401`);
      token = undefined;
      res = await request(url);
    }
    if (res.status !== 200) {
      // Status and the public repository URL only; never the token.
      console.warn(`github: ${repoUrl} responded ${res.status}`);
      throw new Error(`GitHub responded ${res.status}`);
    }
    return res.json();
  };
  try {
    const info = repoBody.parse(await get(base));
    const commits = commitsBody.parse(
      await get(`${base}/commits?sha=${encodeURIComponent(info.default_branch)}&per_page=1`),
    );
    return {
      lastCommit: commits[0]!.commit.committer.date.slice(0, 10),
      topics: info.topics.filter((topic) => TOPIC.test(topic)),
    };
  } catch {
    return null;
  }
}

/** Test builds (E2E_SELFTEST=1) read a fixture; deployed builds call GitHub. */
export async function repoMeta(repoUrl: string): Promise<RepoMeta | null> {
  if (process.env.E2E_SELFTEST === '1') return githubFixture[repoUrl] ?? null;
  return fetchRepoMeta(repoUrl, { token: process.env.GH_DATA_TOKEN || undefined });
}
