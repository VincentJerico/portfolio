import type { QualityReport } from './quality';

// Builds src/generated/quality.json from one CI run (spec 12.6). Pure, so it is unit-tested; the
// script in scripts/build-quality-report.ts only gathers the inputs.

type JobResult = 'success' | 'failure' | 'cancelled' | 'skipped' | string;

interface PwResult {
  status: string;
  duration: number;
}
interface PwSpec {
  title: string;
  tests: { projectName: string; results: PwResult[] }[];
}
interface PwSuite {
  title: string;
  specs: PwSpec[];
  suites?: PwSuite[];
}
export interface PlaywrightReport {
  suites: PwSuite[];
  stats: { expected: number; unexpected: number; flaky: number; skipped: number };
}

export interface LighthouseRun {
  url: string;
  summary: { performance: number; accessibility: number; 'best-practices': number; seo: number };
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export interface BuildInputs {
  jobs: {
    static: JobResult;
    build: JobResult;
    e2e: JobResult;
    lighthouse: JobResult;
    links: JobResult;
  };
  /** Playwright JSON results by project (chromium, webkit, mobile-chrome). */
  playwright?: Record<string, PlaywrightReport>;
  lighthouse?: LighthouseRun[];
  commit: string;
  runUrl: string;
  now: string;
}

const pass = (job: JobResult) => (job === 'success' ? 'pass' : 'fail');

function allSpecs(suites: readonly PwSuite[]): PwSpec[] {
  return suites.flatMap((suite) => [...suite.specs, ...allSpecs(suite.suites ?? [])]);
}

/** Per-route status and duration from the Chromium run of the integrity and axe specs. */
function routeResults(report: PlaywrightReport | undefined): QualityReport['routes'] {
  const routes: QualityReport['routes'] = {};
  for (const spec of allSpecs(report?.suites ?? [])) {
    const route =
      /^(\/\S*): layout, headings and published text$/.exec(spec.title)?.[1] ??
      /^(\/\S*) has no WCAG violations$/.exec(spec.title)?.[1];
    if (!route) continue;
    for (const test of spec.tests.filter((t) => t.projectName === 'chromium')) {
      const final = test.results.at(-1);
      if (!final) continue;
      const entry = routes[route] ?? { status: 'pass', durationMs: 0 };
      routes[route] = {
        status: entry.status === 'fail' || final.status !== 'passed' ? 'fail' : 'pass',
        durationMs: entry.durationMs + final.duration,
      };
    }
  }
  return routes;
}

export function buildQualityReport(inputs: BuildInputs): QualityReport {
  const { jobs, playwright = {} } = inputs;
  const projects = Object.keys(playwright);
  const e2e = projects.length
    ? Object.values(playwright).reduce(
        (sum, run) => ({
          expected: sum.expected + run.stats.expected,
          unexpected: sum.unexpected + run.stats.unexpected,
          flaky: sum.flaky + run.stats.flaky,
          skipped: sum.skipped + run.stats.skipped,
        }),
        { expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
      )
    : undefined;
  // Per-score medians across each route's runs: what lighthouserc.json asserts (C27).
  const runsByUrl = Map.groupBy(inputs.lighthouse ?? [], (run) => run.url);
  // How many runs each median came from (the fewest any route had), so the wording follows the config.
  const runsPerRoute = Math.min(...[...runsByUrl.values()].map((runs) => runs.length));
  const lighthouse = [...runsByUrl].map(([url, runs]) => {
    const score = (key: keyof LighthouseRun['summary']) =>
      Math.round(median(runs.map((run) => run.summary[key])) * 100);
    return {
      route: new URL(url).pathname,
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
    };
  });

  const gates: QualityReport['gates'] = [
    {
      gate: 'Lint and format',
      tool: 'ESLint (0 warnings), Prettier',
      result: pass(jobs.static),
      details: 'Every file',
    },
    {
      gate: 'Types',
      tool: 'TypeScript strict',
      result: pass(jobs.static),
      details: 'tsc --noEmit',
    },
    {
      gate: 'Unit and content guards',
      tool: 'Vitest',
      result: pass(jobs.static),
      details: 'Schemas, data integrity, private-term denylist, with self-tests',
    },
    {
      gate: 'Build',
      tool: 'Next.js',
      result: pass(jobs.build),
      details: 'Every route prerendered; CV PDF generated',
    },
    {
      gate: 'End-to-end, accessibility and security headers',
      tool: 'Playwright, axe-core',
      result: pass(jobs.e2e),
      details: e2e
        ? `${e2e.expected} passed, ${e2e.unexpected} failed, ${e2e.flaky} flaky across ${projects.join(', ')}`
        : 'Chromium, WebKit and mobile Chrome',
    },
    {
      gate: 'Lighthouse',
      tool: 'Lighthouse CI',
      result: pass(jobs.lighthouse),
      details: lighthouse.length
        ? `${lighthouse.length} routes, mobile, median of ${runsPerRoute} runs`
        : 'Five routes, mobile',
    },
    {
      gate: 'Link check',
      tool: 'lychee',
      result: pass(jobs.links),
      details: 'All links in the built pages',
    },
  ];

  return {
    sample: false,
    generatedAt: inputs.now,
    commit: inputs.commit.slice(0, 7),
    runUrl: inputs.runUrl,
    overall: Object.values(jobs).every((job) => job === 'success') ? 'pass' : 'fail',
    gates,
    routes: routeResults(playwright.chromium),
    lighthouse,
    ...(e2e
      ? {
          e2e: {
            passed: e2e.expected,
            failed: e2e.unexpected,
            flaky: e2e.flaky,
            skipped: e2e.skipped,
          },
        }
      : {}),
  };
}
