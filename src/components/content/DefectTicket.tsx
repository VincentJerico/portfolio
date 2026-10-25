import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { Finding } from '@/content/schema';
import { InlineCode } from '@/components/ui/InlineCode';
import { SeverityChip } from '@/components/ui/SeverityChip';

/** One finding as a collapsible defect ticket (spec 4.4 D). Body fields render only when present. */
export function DefectTicket({
  finding,
  evidenceLabel,
}: {
  finding: Finding;
  evidenceLabel?: string;
}) {
  const rows: [string, React.ReactNode][] = [];
  if (finding.reference) rows.push(['Reference', finding.reference]);
  if (finding.note) rows.push(['Note', <InlineCode key="n" text={finding.note} />]);
  if (finding.steps?.length) {
    rows.push([
      'Steps to reproduce',
      <ol key="s" className="list-decimal pl-5">
        {finding.steps.map((step) => (
          <li key={step}>
            <InlineCode text={step} />
          </li>
        ))}
      </ol>,
    ]);
  }
  if (finding.expected) rows.push(['Expected', <InlineCode key="e" text={finding.expected} />]);
  if (finding.actual) rows.push(['Actual', <InlineCode key="a" text={finding.actual} />]);
  if (finding.trackedBy)
    rows.push([
      'Tracked by',
      <code key="t" className="font-mono text-sm">
        {finding.trackedBy}
      </code>,
    ]);
  if (finding.ticketStatus) rows.push(['Status', finding.ticketStatus]);
  if (evidenceLabel && finding.evidenceIndex !== undefined) {
    rows.push([
      'Evidence',
      <a key="ev" href={`#evidence-${finding.evidenceIndex}`}>
        {evidenceLabel}
      </a>,
    ]);
  }

  return (
    <details
      id={`ticket-${finding.id}`}
      data-ticket-severity={finding.severity}
      className="group scroll-mt-20 rounded-card border border-line bg-surface open:border-accent/50"
    >
      <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="font-mono text-ink-muted transition-transform group-open:rotate-90"
        >
          ›
        </span>
        <span className="font-mono text-sm font-medium text-ink">{finding.id}</span>
        <span className="min-w-0 flex-1 text-[0.9375rem] text-ink">
          <InlineCode text={finding.title} />
        </span>
        <SeverityChip severity={finding.severity} />
      </summary>
      <div className="border-t border-line px-4 py-4">
        {rows.length > 0 && (
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
            {rows.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="label-mono pt-0.5 text-ink-muted">{term}</dt>
                <dd className="text-[0.9375rem] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <a
          href={finding.sourceHref}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold"
        >
          Read {finding.id} in the source report
          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </details>
  );
}
