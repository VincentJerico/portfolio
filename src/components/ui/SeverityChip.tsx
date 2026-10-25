import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import type { Severity } from '@/content/schema';

// Spec 4.2: never colour alone; every chip has a text label and an icon.
const STYLE: Record<Severity, { tone: string; Icon: typeof Info }> = {
  critical: { tone: 'text-fail border-fail/50', Icon: OctagonAlert },
  serious: { tone: 'text-fail border-fail/50', Icon: OctagonAlert },
  high: { tone: 'text-fail border-fail/50', Icon: OctagonAlert },
  medium: { tone: 'text-warn border-warn/50', Icon: AlertTriangle },
  moderate: { tone: 'text-warn border-warn/50', Icon: AlertTriangle },
  low: { tone: 'text-ink-muted border-line', Icon: Info },
  info: { tone: 'text-ink-muted border-line', Icon: Info },
};

export function SeverityChip({ severity, count }: { severity: Severity; count?: number }) {
  const { tone, Icon } = STYLE[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip border bg-surface px-2 py-0.5 font-mono text-xs font-medium tracking-[0.04em] whitespace-nowrap uppercase ${tone}`}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {count !== undefined && <span>{count}</span>}
      {severity}
    </span>
  );
}
