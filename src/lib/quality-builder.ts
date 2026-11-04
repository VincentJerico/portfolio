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
  isRepresentativeRun: boolean;
  summary: { performance: number; accessibility: number; 'best-practices': number; seo: number };
}

export interface BuildInputs {
  jobs: {
    static: JobResult;
    build: JobResult;
    e2e: JobResult;
    lighthouse: JobResult;
    links: JobResult;
  };
  playwright?: PlaywrightReport;
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
  const { jobs, playwright } = inputs;
  const e2e = playwright?.stats;
  const lighthouse = (inputs.lighthouse ?? [])
    .filter((run) => run.isRepresentativeRun)
    .map((run) => ({
      route: new URL(run.url).pathname,
      performance: Math.round(run.summary.performance * 100),
      accessibility: Math.round(run.summary.accessibility * 100),
      bestPractices: Math.round(run.summary['best-practices'] * 100),
      seo: Math.round(run.summary.seo * 100),
    }));

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
        ? `${e2e.expected} passed, ${e2e.unexpected} failed, ${e2e.flaky} flaky across Chromium, WebKit and mobile Chrome`
        : 'Chromium, WebKit and mobile Chrome',
    },
    {
      gate: 'Lighthouse',
      tool: 'Lighthouse CI',
      result: pass(jobs.lighthouse),
      details: lighthouse.length
        ? `${lighthouse.length} routes, mobile, median of 3 runs`
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
    routes: routeResults(playwright),
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
