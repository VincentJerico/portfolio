// Writes lighthouserc.remote.json: the budgets in lighthouserc.json, pointed at a deployment instead of
// a local server, so production and the CI build are held to the same numbers.
//
//   pnpm exec tsx scripts/lighthouse-remote.ts <url> preview|production
//
// Previews are served with `x-robots-tag: noindex` by Vercel, which Lighthouse's SEO category scores as
// "blocked from indexing"; there the SEO category is not asserted. Production asserts everything.
//
// Blocking time and the performance score use deployed budgets (C26): on the CI runner the hydration task
// measures about 40 ms longer against Vercel than against a local server, for the same build, and blocking
// time is 30% of the score (300 ms alone scores 0.94). The local gate's blocking budget is also 300 ms
// since C41, with a performance score of 0.94 to match (C43); deployments allow 0.93.
import { readFileSync, writeFileSync } from 'node:fs';

const LOCAL = 'http://localhost:3300';
const DEPLOYED_TBT_MS = 300;
const DEPLOYED_MIN_PERFORMANCE = 0.93;
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
let tbtBudgets = 0;
let performanceBudgets = 0;
for (const entry of assert.assertMatrix) {
  entry.matchingUrlPattern = entry.matchingUrlPattern.replace('http://localhost:3300', escaped);
  if (target === 'preview') delete entry.assertions['categories:seo'];
  const tbt = entry.assertions['total-blocking-time'];
  if (typeof tbt?.[1]?.maxNumericValue === 'number') {
    tbt[1].maxNumericValue = DEPLOYED_TBT_MS;
    tbtBudgets++;
  }
  const performance = entry.assertions['categories:performance'];
  if (typeof performance?.[1]?.minScore === 'number') {
    performance[1].minScore = DEPLOYED_MIN_PERFORMANCE;
    performanceBudgets++;
  }
}
// A renamed or removed budget must fail here, not silently leave deployments unchecked.
if (tbtBudgets === 0) throw new Error('lighthouserc.json has no total-blocking-time budget');
if (performanceBudgets === 0) throw new Error('lighthouserc.json has no performance budget');
config.ci.upload.outputDir = `.lighthouseci/${target}`;

writeFileSync('lighthouserc.remote.json', `${JSON.stringify(config, null, 2)}\n`);
console.log(`lighthouserc.remote.json -> ${origin} (${target})`);
