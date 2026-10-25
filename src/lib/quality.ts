import { z } from 'zod';
import { formatDay } from './format';

// Shape of src/generated/quality.json, written by CI on main (spec 12.6). A committed sample with
// `sample: true` renders as "not run": the site never shows a PASS it did not earn.
const Result = z.enum(['pass', 'fail']);

export const QualityReport = z.object({
  sample: z.boolean(),
  generatedAt: z.iso.datetime(),
  commit: z.string(),
  runUrl: z.url(),
  overall: Result,
  gates: z.array(
    z.object({
      gate: z.string(),
      tool: z.string(),
      result: Result.or(z.literal('warn')),
      details: z.string(),
    }),
  ),
  routes: z.record(z.string(), z.object({ status: Result, durationMs: z.number().nonnegative() })),
});

export type QualityReport = z.output<typeof QualityReport>;
export type RunStatus = 'pass' | 'fail' | 'not-run';

export function parseQuality(data: unknown): QualityReport {
  return QualityReport.parse(data);
}

export function routeStatus(report: QualityReport | undefined, path: string): RunStatus {
  if (!report || report.sample) return 'not-run';
  return report.routes[path]?.status ?? 'not-run';
}

export function routeDuration(report: QualityReport | undefined, path: string): string | undefined {
  if (!report || report.sample) return undefined;
  const ms = report.routes[path]?.durationMs;
  return ms === undefined ? undefined : `${(ms / 1000).toFixed(1)}s`;
}

export function siteStatus(report: QualityReport | undefined): RunStatus {
  return !report || report.sample ? 'not-run' : report.overall;
}

export function runSummaryLine(report: QualityReport | undefined): string {
  if (!report || report.sample) return 'not run yet';
  const results = Object.values(report.routes);
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.length - passed;
  return `${passed} passed · ${failed} failed · last run ${formatDay(report.generatedAt.slice(0, 10))}`;
}
