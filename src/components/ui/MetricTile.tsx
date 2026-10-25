import type { Metric } from '@/content/schema';

export function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="flex h-full flex-col gap-2 bg-surface p-4">
      <p className="font-mono text-2xl font-medium tracking-tight text-ink">{metric.value}</p>
      <p className="text-sm leading-snug text-ink">{metric.label}</p>
      {metric.context && <p className="text-xs leading-snug text-ink-muted">{metric.context}</p>}
      <a
        href={metric.source.href}
        className="label-mono mt-auto inline-flex min-h-6 items-center self-start text-accent"
      >
        source<span className="sr-only">: {metric.source.label}</span>
      </a>
    </div>
  );
}
