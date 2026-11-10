import { describe, expect, it } from 'vitest';
import { buildQualityReport, type BuildInputs } from '@/lib/quality-builder';
import { parseQuality } from '@/lib/quality';

const passingSuite = {
  suites: [
    {
      title: 'a11y/routes.spec.ts',
      specs: [],
      suites: [
        {
          title: 'dark theme',
          specs: [
            {
              title: '/ has no WCAG violations',
              tests: [{ projectName: 'chromium', results: [{ status: 'passed', duration: 900 }] }],
            },
            {
              title: '/about has no WCAG violations',
              tests: [{ projectName: 'chromium', results: [{ status: 'passed', duration: 700 }] }],
            },
          ],
        },
      ],
    },
    {
      title: 'e2e/integrity.spec.ts',
      specs: [
        {
          title: '/: layout, headings and published text',
          tests: [{ projectName: 'chromium', results: [{ status: 'passed', duration: 1200 }] }],
        },
        {
          title: '/about: layout, headings and published text',
          tests: [{ projectName: 'chromium', results: [{ status: 'failed', duration: 800 }] }],
        },
      ],
    },
  ],
  stats: { expected: 3, unexpected: 1, flaky: 0, skipped: 0 },
};

const inputs: BuildInputs = {
  jobs: {
    static: 'success',
    build: 'success',
    e2e: 'failure',
    lighthouse: 'success',
    links: 'success',
  },
  playwright: {
    chromium: passingSuite,
    webkit: { suites: [], stats: { expected: 10, unexpected: 0, flaky: 1, skipped: 2 } },
  },
  lighthouse: [
    {
      url: 'http://localhost:3300/',
      summary: { performance: 1, accessibility: 1, 'best-practices': 1, seo: 1 },
    },
  ],
  commit: 'abcdef1234567',
  runUrl: 'https://github.com/VincentJerico/portfolio/actions/runs/42',
  now: '2026-11-04T10:00:00.000Z',
};

describe('buildQualityReport', () => {
  const report = buildQualityReport(inputs);

  it('produces a valid, non-sample report', () => {
    expect(parseQuality(report).sample).toBe(false);
    expect(report.commit).toBe('abcdef1');
  });

  it('marks the run failed and the failing gate FAIL, never a stale PASS', () => {
    expect(report.overall).toBe('fail');
    expect(report.gates.find((g) => g.gate.startsWith('End-to-end'))?.result).toBe('fail');
    expect(report.gates.find((g) => g.gate === 'Lighthouse')?.result).toBe('pass');
  });

  it('derives each route from its integrity and axe results', () => {
    expect(report.routes['/']).toEqual({ status: 'pass', durationMs: 2100 });
    expect(report.routes['/about']?.status).toBe('fail');
  });

  it('carries Lighthouse scores per route', () => {
    expect(report.lighthouse).toEqual([
      { route: '/', performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
    ]);
  });

  it('reports the median of each score across runs, as the gate asserts it', () => {
    const run = (performance: number, accessibility: number) => ({
      url: 'http://localhost:3300/about',
      summary: { performance, accessibility, 'best-practices': 1, seo: 1 },
    });
    const median = buildQualityReport({
      ...inputs,
      lighthouse: [run(0.93, 1), run(0.99, 0.98), run(0.98, 1)],
    });
    expect(median.lighthouse).toEqual([
      { route: '/about', performance: 98, accessibility: 100, bestPractices: 100, seo: 100 },
    ]);
  });

  it('states how many runs each median came from, counted from the runs it received', () => {
    const run = (url: string) => ({
      url,
      summary: { performance: 1, accessibility: 1, 'best-practices': 1, seo: 1 },
    });
    const five = buildQualityReport({
      ...inputs,
      lighthouse: [1, 2, 3, 4, 5].flatMap(() => [
        run('http://localhost:3300/'),
        run('http://localhost:3300/about'),
      ]),
    });
    expect(five.gates.find((g) => g.gate === 'Lighthouse')?.details).toBe(
      '2 routes, mobile, median of 5 runs',
    );
  });

  it('sums E2E counts across every browser run, and says so', () => {
    expect(report.e2e).toEqual({ passed: 13, failed: 1, flaky: 1, skipped: 2 });
    expect(report.gates.find((g) => g.gate.startsWith('End-to-end'))?.details).toBe(
      '13 passed, 1 failed, 1 flaky across chromium, webkit',
    );
  });

  it('reports a cancelled or skipped job as failed', () => {
    const cancelled = buildQualityReport({
      ...inputs,
      jobs: { ...inputs.jobs, e2e: 'success', links: 'cancelled' },
    });
    expect(cancelled.overall).toBe('fail');
    expect(cancelled.gates.find((g) => g.gate === 'Link check')?.result).toBe('fail');
  });
});
