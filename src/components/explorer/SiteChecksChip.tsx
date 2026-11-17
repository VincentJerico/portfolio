import Link from 'next/link';
import type { RunStatus } from '@/lib/quality';

const LABEL: Record<RunStatus, string> = { pass: 'PASS', fail: 'FAIL', 'not-run': 'not run' };

/** The site's own CI result, linking to /quality (spec 4.3): in the drawer and the status bar. */
export function SiteChecksChip({ status, bar = false }: { status: RunStatus; bar?: boolean }) {
  const tone =
    status === 'pass'
      ? 'text-pass border-pass/50'
      : status === 'fail'
        ? 'text-fail border-fail/50'
        : 'text-ink-muted border-line';
  if (bar) {
    // A 44 px target around a compact chip, so the status line stays thin.
    return (
      <Link href="/quality" className="group inline-flex min-h-11 items-center px-1 no-underline">
        <span
          className={`rounded-chip border px-2 py-0.5 font-mono text-[0.6875rem] group-hover:bg-surface-2 ${tone}`}
        >
          Site checks: {LABEL[status]}
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
