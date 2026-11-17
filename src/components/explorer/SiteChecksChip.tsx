import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { RunStatus } from '@/lib/quality';

const LABEL: Record<RunStatus, string> = { pass: 'PASS', fail: 'FAIL', 'not-run': 'not run' };

/** The site's own CI result, linking to /quality (spec 4.3): in the drawer and the status bar. */
export function SiteChecksChip({
  status,
  bar = false,
  summary,
}: {
  status: RunStatus;
  bar?: boolean;
  /** The run summary line, read out after the result in the status bar. */
  summary?: string;
}) {
  const tone =
    status === 'pass'
      ? 'text-pass border-pass/50'
      : status === 'fail'
        ? 'text-fail border-fail/50'
        : 'text-ink-muted border-line';
  if (bar) {
    // An icon in the minimal status bar; the result and run summary are in its label and tooltip.
    return (
      <Link
        href="/quality"
        data-tip={`Site checks: ${LABEL[status]}`}
        className="tip inline-flex size-11 items-center justify-center rounded-chip text-ink-muted no-underline hover:bg-surface-2 hover:text-ink"
      >
        <ShieldCheck aria-hidden="true" className="size-4" />
        <span className="sr-only">
          Site checks: {LABEL[status]}
          {summary && ` · ${summary}`}
        </span>
      </Link>
    );
  }
  return (
    <Link
      href="/quality"
      className={`inline-flex min-h-11 items-center gap-2 rounded-chip border px-2.5 font-mono text-xs no-underline hover:bg-surface-2 ${tone}`}
    >
      Site checks: {LABEL[status]}
    </Link>
  );
}
