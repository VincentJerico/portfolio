import type { Metric } from '@/content/schema';

interface Line {
  suite: string;
  metricId: string;
  /** Text after the metric value; the value itself always comes from metrics.ts. */
  after: string;
}

// Spec 7.1.1: result lines built only from verified metrics. The block is aria-hidden; the same
// facts are text in the run summary strip below.
const LINES: Line[] = [
  {
    suite: 'accessibility-testing',
    metricId: 'wcag-failures',
    after: 'WCAG failures found where axe reported 0',
  },
  {
    suite: 'security-testing',
    metricId: 'owasp-findings',
    after: 'findings mapped to the OWASP Top 10',
  },
  { suite: 'performance-testing', metricId: 'login-latency', after: 'under 60 logins/s' },
  { suite: 'taskflow-under-test', metricId: 'seeded-bugs', after: 'seeded bugs caught' },
  { suite: 'qa-engineering-journey', metricId: 'automated-tests', after: 'automated tests in CI' },
];

export function RunnerHeroBlock({ metrics }: { metrics: readonly Metric[] }) {
  const lines = LINES.flatMap((line) => {
    const metric = metrics.find((m) => m.id === line.metricId);
    return metric ? [{ ...line, value: metric.value }] : [];
  });

  return (
    <div
      data-runner-hero
      aria-hidden="true"
      className="w-full overflow-hidden rounded-card border border-line bg-surface-2 font-mono text-[0.75rem] leading-relaxed shadow-card"
    >
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="size-2 rounded-full bg-fail/70" />
        <span className="size-2 rounded-full bg-warn/70" />
        <span className="size-2 rounded-full bg-pass/70" />
        <span className="ml-2 text-ink-muted">vincent@portfolio</span>
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        <p data-line className="runner-line text-ink" style={{ animationDelay: '0.1s' }}>
          <span className="text-accent">$</span> npx playwright test --project=vincent
        </p>
        {lines.map((line, i) => (
          <p
            key={line.suite}
            data-line
            className="runner-line flex gap-3 whitespace-nowrap text-ink-muted"
            style={{ animationDelay: `${0.9 + i * 0.45}s` }}
          >
            <span className="text-pass">PASS</span>
            <span className="text-ink">{line.suite}</span>
            <span>
              <span data-metric-value className="text-ink">
                {line.value}
              </span>{' '}
              {line.after}
            </span>
          </p>
        ))}
        <p
          data-line
          className="runner-line mt-1 text-ink-muted"
          style={{ animationDelay: `${0.9 + lines.length * 0.45}s` }}
        >
          <span className="text-pass">{lines.length} passed</span>
        </p>
      </div>
    </div>
  );
}
