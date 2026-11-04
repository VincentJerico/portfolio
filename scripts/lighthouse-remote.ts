// Writes lighthouserc.remote.json: the budgets in lighthouserc.json, pointed at a deployment instead of
// a local server, so production and the CI build are held to the same numbers.
//
//   pnpm exec tsx scripts/lighthouse-remote.ts <url> preview|production
//
// Previews are served with `x-robots-tag: noindex` by Vercel, which Lighthouse's SEO category scores as
// "blocked from indexing"; there the SEO category is not asserted. Production asserts everything.
import { readFileSync, writeFileSync } from 'node:fs';

const LOCAL = 'http://localhost:3300';
const [url, target] = process.argv.slice(2);
if (!url || (target !== 'preview' && target !== 'production')) {
  console.error('usage: lighthouse-remote.ts <url> preview|production');
  process.exit(2);
}
const origin = new URL(url).origin;
const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = JSON.parse(readFileSync('lighthouserc.json', 'utf8'));
const { collect, assert } = config.ci;
delete collect.startServerCommand;
delete collect.startServerReadyPattern;
collect.url = collect.url.map((u: string) => u.replace(LOCAL, origin));
for (const entry of assert.assertMatrix) {
  entry.matchingUrlPattern = entry.matchingUrlPattern.replace('http://localhost:3300', escaped);
  if (target === 'preview') delete entry.assertions['categories:seo'];
}
config.ci.upload.outputDir = `.lighthouseci/${target}`;

writeFileSync('lighthouserc.remote.json', `${JSON.stringify(config, null, 2)}\n`);
console.log(`lighthouserc.remote.json -> ${origin} (${target})`);
