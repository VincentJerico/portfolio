import type { Severity } from '@/content/schema';

const FILL: Record<Severity, string> = {
  critical: 'bg-fail',
  serious: 'bg-fail',
  high: 'bg-fail',
  medium: 'bg-warn',
  moderate: 'bg-warn',
  low: 'bg-ink-muted',
  info: 'bg-ink-muted',
};

/**
 * The share of findings at each severity, as one segmented bar. Decorative: the severity chips beside
 * it carry the counts as text, so it is hidden from assistive tech.
 */
export function SeverityBar({ counts }: { counts: { severity: Severity; count: number }[] }) {
  return (
    <div aria-hidden="true" data-severity-bar className="flex h-2 w-full max-w-sm gap-0.5">
      {counts.map(({ severity, count }) => (
        <span
          key={severity}
          title={`${count} ${severity}`}
          style={{ flexGrow: count }}
          className={`basis-0 first:rounded-l-full last:rounded-r-full ${FILL[severity]}`}
        />
      ))}
    </div>
  );
}
