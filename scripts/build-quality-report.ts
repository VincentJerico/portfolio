// CI only (quality-report job): gathers one run's results and writes src/generated/quality.json.
// Inputs: JOB_RESULTS (JSON of needs.*.result), reports/playwright/results.json (Chromium run),
// reports/lighthouse/manifest.json, plus GitHub's GITHUB_* variables.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildQualityReport } from '../src/lib/quality-builder';

const readJson = (path: string) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SHA, JOB_RESULTS } =
  process.env;
if (!JOB_RESULTS || !GITHUB_SHA) throw new Error('JOB_RESULTS and GITHUB_SHA are required');

const report = buildQualityReport({
  jobs: JSON.parse(JOB_RESULTS),
  playwright: readJson('reports/playwright/results.json'),
  lighthouse: readJson('reports/lighthouse/manifest.json'),
  commit: GITHUB_SHA,
  runUrl: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
  now: new Date().toISOString(),
});
writeFileSync('src/generated/quality.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`quality.json: overall ${report.overall}, ${Object.keys(report.routes).length} routes`);
