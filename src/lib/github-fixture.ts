import { projectsInOrder } from '@/lib/content';
import type { RepoMeta } from '@/lib/github';

/** Obviously fake values for test builds (E2E_SELFTEST=1): one entry per project that has a repo. */
export const githubFixture: Record<string, RepoMeta> = Object.fromEntries(
  projectsInOrder().flatMap(({ repo }) =>
    repo ? [[repo, { lastCommit: '2000-01-01', topics: ['fixture-topic'] }]] : [],
  ),
);
