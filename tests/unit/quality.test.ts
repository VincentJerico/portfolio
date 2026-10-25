import { describe, expect, it } from 'vitest';
import { parseQuality, routeStatus, runSummaryLine, siteStatus } from '@/lib/quality';

const real = parseQuality({
  sample: false,
  generatedAt: '2026-10-24T10:00:00Z',
  commit: 'abc1234',
  runUrl: 'https://github.com/VincentJerico/portfolio/actions/runs/1',
  overall: 'pass',
  gates: [{ gate: 'Lint', tool: 'ESLint', result: 'pass', details: '0 warnings' }],
  routes: {
    '/': { status: 'pass', durationMs: 1200 },
    '/about': { status: 'fail', durationMs: 900 },
  },
});

describe('quality report', () => {
  it('reports real route results', () => {
    expect(routeStatus(real, '/')).toBe('pass');
    expect(routeStatus(real, '/about')).toBe('fail');
  });

  it('reports not-run for routes the report does not cover', () => {
    expect(routeStatus(real, '/contact')).toBe('not-run');
  });

  it('never reports PASS from a sample report', () => {
    const sample = parseQuality({ ...real, sample: true });
    expect(routeStatus(sample, '/')).toBe('not-run');
    expect(siteStatus(sample)).toBe('not-run');
    expect(runSummaryLine(sample)).toBe('not run yet');
  });

  it('never reports PASS when the report is missing', () => {
    expect(routeStatus(undefined, '/')).toBe('not-run');
    expect(siteStatus(undefined)).toBe('not-run');
  });

  it('summarises a real run', () => {
    expect(runSummaryLine(real)).toBe('1 passed · 1 failed · last run 24 Oct 2026');
    expect(siteStatus(real)).toBe('pass');
  });
});
