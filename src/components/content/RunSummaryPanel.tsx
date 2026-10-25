import type { Project } from '@/content/schema';
import { CiBadge } from '@/components/ui/CiBadge';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatProjectPeriod } from '@/lib/format';
import { severityCounts } from '@/lib/labels';
import { InlineCode } from '@/components/ui/InlineCode';

/** Control-panel header of a test report (spec 7.3.3). Counts come from the listed findings. */
export function RunSummaryPanel({ project }: { project: Project }) {
  const period = formatProjectPeriod(project);
  const counts = severityCounts(project.findings);
  const rows: [string, React.ReactNode][] = [];
  if (project.target) rows.push(['Target', <InlineCode key="t" text={project.target} />]);
  if (period) rows.push(['Period', period]);
  if (project.commits !== undefined) rows.push(['Commits', String(project.commits)]);
  rows.push([
    'Tools',
    <ul key="tools" className="flex flex-wrap gap-1.5">
      {project.stack.map((tool) => (
        <li key={tool} className="rounded-chip bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink">
          {tool}
        </li>
      ))}
    </ul>,
  ]);
  if (counts.length > 0) {
    rows.push([
      'Findings',
      <ul key="f" className="flex flex-wrap gap-1.5">
        {counts.map(({ severity, count }) => (
          <li key={severity}>
            <a
              href={`#ticket-${project.findings.find((f) => f.severity === severity)!.id}`}
              data-open-severity={severity}
              className="inline-flex items-center no-underline pointer-coarse:min-h-11"
            >
              <SeverityChip severity={severity} count={count} />
            </a>
          </li>
        ))}
      </ul>,
    ]);
  }

  return (
    <section
      aria-labelledby="run-summary-heading"
      className="rounded-card border border-line bg-surface shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 id="run-summary-heading" className="label-mono text-ink-muted">
          Run summary
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {project.team && <StatusChip status="info" label="Team project" />}
          {project.ciBadge && (
            <CiBadge src={project.ciBadge} href={project.ciUrl} repo={project.name} />
          )}
        </div>
      </div>
      <dl className="grid gap-x-8 gap-y-4 px-5 py-5 sm:grid-cols-[8rem_1fr]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="label-mono pt-0.5 text-ink-muted">{term}</dt>
            <dd className="text-[0.9375rem] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {(project.repo || project.liveUrl) && (
        <div className="flex flex-wrap gap-x-6 border-t border-line px-5 py-2">
          {project.repo && (
            <a href={project.repo} className="inline-flex min-h-11 items-center font-semibold">
              Repo<span className="sr-only">: {project.name} on GitHub</span>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} className="inline-flex min-h-11 items-center font-semibold">
              Live site<span className="sr-only">: {project.name}</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
