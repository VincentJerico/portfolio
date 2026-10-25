import Link from 'next/link';
import type { RunStatus } from '@/lib/quality';

const LABEL: Record<RunStatus, string> = { pass: 'PASS', fail: 'FAIL', 'not-run': 'not run' };

/** Sidebar footer chip: the site's own CI result, linking to /quality (spec 4.3). */
export function SiteChecksChip({ status }: { status: RunStatus }) {
  const tone =
    status === 'pass'
      ? 'text-pass border-pass/50'
      : status === 'fail'
        ? 'text-fail border-fail/50'
        : 'text-ink-muted border-line';
  return (
    <Link
      href="/quality"
      className={`inline-flex min-h-11 items-center gap-2 rounded-chip border px-2.5 font-mono text-xs no-underline hover:bg-surface-2 ${tone}`}
    >
      Site checks: {LABEL[status]}
    </Link>
  );
}
