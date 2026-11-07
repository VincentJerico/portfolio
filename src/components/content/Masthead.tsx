import type { Metric } from '@/content/schema';
import { DecodeLabel } from '@/components/ui/DecodeLabel';

interface MastheadProps {
  location: string;
  testedAreas: readonly string[];
  /** The "repos with CI" metric; the CI row is left out when it is missing. */
  ci?: Metric;
}

/**
 * A spec-sheet strip above the hero. It carries only what the rest of the page does not: name, role
 * and the clock live in the sidebar, and the run totals in the Run summary section.
 */
export function Masthead({ location, testedAreas, ci }: MastheadProps) {
  const rows: [string, React.ReactNode][] = [
    ['based in', location],
    ['tests for', testedAreas.join(' · ')],
  ];
  if (ci) {
    rows.push([
      'CI',
      <>
        <span aria-hidden="true" className="mr-2 inline-block size-1.5 rounded-full bg-pass" />
        {ci.value} · {ci.label}
      </>,
    ]);
  }
  return (
    <section
      aria-label="At a glance"
      data-masthead
      className="rounded-card border border-line bg-surface px-5 py-4 font-mono text-[0.6875rem] leading-relaxed"
    >
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-ink-muted">
              <DecodeLabel text={label} />
            </dt>
            <dd className="mt-1 text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
