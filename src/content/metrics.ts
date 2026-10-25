import type { z } from 'zod';
import type { Metric } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 2 (as of 2026-10-24). Parentheticals in a value cell move to
// `context`; sources link to the repo or file the data file cites (decision C6).
const REPOS = 'https://github.com/VincentJerico';
const asOf = '2026-10-24';

export const metrics: z.input<typeof Metric>[] = [
  {
    id: 'public-repos',
    value: '7',
    label: 'Public QA project repos',
    source: { label: 'GitHub repositories', href: `${REPOS}?tab=repositories` },
    asOf,
  },
  {
    id: 'ci-repos',
    value: '7 of 7',
    label: 'Repos with a GitHub Actions CI pipeline',
    context: '.github/workflows/ci.yml in each',
    source: { label: 'GitHub repositories', href: `${REPOS}?tab=repositories` },
    asOf,
  },
  {
    id: 'automated-tests',
    value: '108',
    label: 'Automated tests in qa-engineering-journey',
    context: '91 Playwright UI + 17 Playwright API',
    source: { label: 'qa-engineering-journey README', href: `${REPOS}/qa-engineering-journey` },
    asOf,
  },
  {
    id: 'manual-cases',
    value: '91',
    label: 'Manual test cases written and executed',
    context: '47 SauceDemo + 44 The Internet',
    source: { label: 'qa-engineering-journey README', href: `${REPOS}/qa-engineering-journey` },
    asOf,
  },
  {
    id: 'wcag-failures',
    value: '7',
    label: 'WCAG 2.2 failures found by keyboard audit where axe-core WCAG rules reported 0',
    source: {
      label: 'accessibility-testing FINDINGS',
      href: `${REPOS}/accessibility-testing/blob/main/docs/FINDINGS.md`,
    },
    asOf,
  },
  {
    id: 'owasp-findings',
    value: '8',
    label: 'Security findings mapped to OWASP Top 10 (2021)',
    context: 'S-1 to S-7, D-1',
    source: {
      label: 'security-testing FINDINGS',
      href: `${REPOS}/security-testing/blob/main/docs/FINDINGS.md`,
    },
    asOf,
  },
  {
    id: 'login-latency',
    value: '12 s p95',
    label: 'Worst latency found under login load',
    context: 'a 2 ms read pushed to 12 s at p95 (60 logins/s)',
    source: {
      label: 'performance-testing PERF-001',
      href: `${REPOS}/performance-testing/blob/main/docs/FINDINGS.md#perf-001-login-traffic-stalls-every-other-request`,
    },
    asOf,
  },
  {
    id: 'crud-throughput',
    value: 'over 7,000 requests/s',
    label: 'Peak task-CRUD throughput with zero errors',
    source: {
      label: 'performance-testing OBS-001',
      href: `${REPOS}/performance-testing/blob/main/docs/FINDINGS.md#obs-001-task-crud-is-fast-capacity-depends-on-the-traffic-mix`,
    },
    asOf,
  },
  {
    id: 'seeded-bugs',
    value: '4 of 4',
    label: "Seeded bugs caught by TaskFlow's suite",
    context: '+1 real stored XSS found in a later audit',
    source: {
      label: 'taskflow-under-test BUGS-FOUND',
      href: `${REPOS}/taskflow-under-test/blob/main/docs/BUGS-FOUND.md`,
    },
    asOf,
  },
  {
    id: 'browsers',
    value: '4',
    label: 'Browsers covered by framework CI',
    context: 'Chromium, Firefox, WebKit, mobile Chrome',
    source: {
      label: 'playwright-framework-template README',
      href: `${REPOS}/playwright-framework-template`,
    },
    asOf,
  },
];
