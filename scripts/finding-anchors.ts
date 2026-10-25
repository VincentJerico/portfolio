// Records the GitHub heading anchors of each repo's findings file, so tests can prove every
// finding's sourceHref points at a section that exists. Re-run after the source repos change:
//   pnpm tsx scripts/finding-anchors.ts <dir containing the cloned repos>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { githubSlug } from '../src/lib/slug';

const SOURCES = [
  'accessibility-testing/docs/FINDINGS.md',
  'security-testing/docs/FINDINGS.md',
  'performance-testing/docs/FINDINGS.md',
  'taskflow-under-test/docs/BUGS-FOUND.md',
];

const root = process.argv[2];
if (!root) throw new Error('Usage: pnpm tsx scripts/finding-anchors.ts <clones dir>');

const result = Object.fromEntries(
  SOURCES.map((file) => {
    const [repo] = file.split('/');
    const commit = execFileSync('git', ['-C', join(root, repo!), 'rev-parse', 'HEAD'])
      .toString()
      .trim();
    const anchors = readFileSync(join(root, file), 'utf8')
      .split('\n')
      .filter((line) => /^#{1,6} /.test(line))
      .map((line) => githubSlug(line.replace(/^#+ /, '')));
    const url = `https://github.com/VincentJerico/${repo}/blob/main/${file.slice(repo!.length + 1)}`;
    return [url, { commit, anchors }];
  }),
);

writeFileSync('tests/fixtures/finding-anchors.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote anchors for ${SOURCES.length} files`);
