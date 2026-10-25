import { Inspectable } from '@/components/bughunt/Inspectable';
import type { Metric } from '@/content/schema';

// HUNT-02 (Bug Hunt only): a total that does not match its parts.
const PLANTED_VALUES: Record<string, string> = { 'automated-tests': '109' };

export function MetricTile({ metric }: { metric: Metric }) {
  const planted = PLANTED_VALUES[metric.id];
  return (
    <Inspectable
      id={`metric-${metric.id}`}
      label={`${metric.label} metric`}
      className="h-full"
      planted={planted ? <TileBody metric={{ ...metric, value: planted }} /> : undefined}
    >
      <TileBody metric={metric} />
    </Inspectable>
  );
}

function TileBody({ metric }: { metric: Metric }) {
  return (
    <div className="flex h-full flex-col gap-2 bg-surface p-4">
      <p className="font-mono text-2xl font-medium tracking-tight text-ink">{metric.value}</p>
      <p className="text-sm leading-snug text-ink">{metric.label}</p>
      {metric.context && <p className="text-xs leading-snug text-ink-muted">{metric.context}</p>}
      <a
        href={metric.source.href}
        className="label-mono mt-auto inline-flex min-h-6 items-center self-start text-accent pointer-coarse:min-h-11"
      >
        source<span className="sr-only">: {metric.source.label}</span>
      </a>
    </div>
  );
}
