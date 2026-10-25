import {
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Info,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react';

export type ChipStatus = 'pass' | 'warn' | 'fail' | 'info' | 'running' | 'not-run';

const STYLE: Record<ChipStatus, { tone: string; Icon: typeof Info; label: string }> = {
  pass: { tone: 'text-pass border-pass/50', Icon: CheckCircle2, label: 'Pass' },
  warn: { tone: 'text-warn border-warn/50', Icon: TriangleAlert, label: 'Warn' },
  fail: { tone: 'text-fail border-fail/50', Icon: OctagonAlert, label: 'Fail' },
  info: { tone: 'text-ink-muted border-line', Icon: Info, label: 'Info' },
  running: { tone: 'text-accent border-accent/50', Icon: CircleDot, label: 'Running' },
  'not-run': { tone: 'text-ink-muted border-line', Icon: CircleDashed, label: 'Not run' },
};

/** Status with icon and text (spec 4.2). `label` overrides the default word, e.g. "Currently testing". */
export function StatusChip({ status, label }: { status: ChipStatus; label?: string }) {
  const { tone, Icon, label: fallback } = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip border bg-surface px-2 py-0.5 font-mono text-xs font-medium tracking-[0.04em] uppercase ${tone}`}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label ?? fallback}
    </span>
  );
}
