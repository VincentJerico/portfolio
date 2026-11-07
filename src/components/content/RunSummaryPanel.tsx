import type { Project } from '@/content/schema';
import { CiBadge } from '@/components/ui/CiBadge';
import { SeverityBar } from '@/components/ui/SeverityBar';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDay, formatProjectPeriod } from '@/lib/format';
import type { RepoMeta } from '@/lib/github';
import { severityCounts } from '@/lib/labels';
import { InlineCode } from '@/components/ui/InlineCode';

/** Control-panel header of a test report (spec 7.3.3). Counts come from the listed findings. */
export function RunSummaryPanel({
  project,
  github,
}: {
  project: Project;
  github?: RepoMeta | null;
}) {
  const period = formatProjectPeriod(project);
  const counts = severityCounts(project.findings);
  const rows: [string, React.ReactNode][] = [];
  if (project.target) rows.push(['Target', <InlineCode key="t" text={project.target} />]);
  if (period) rows.push(['Period', period]);
  if (project.commits !== undefined) rows.push(['Commits', String(project.commits)]);
  // The tools scroll slowly in a marquee: the real list plus an aria-hidden copy for the loop. It
  // pauses on hover and focus; under reduced motion and in print the copy goes and the list wraps.
  const chip = 'shrink-0 rounded-chip bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink';
  rows.push([
    'Tools',
    <div
      key="tools"
      data-marquee
      className="marquee"
      style={
        { '--marquee-dur': `${Math.max(12, project.stack.length * 2.5)}s` } as React.CSSProperties
      }
    >
      <div className="marquee-track">
        <ul className="marquee-list">
          {project.stack.map((tool) => (
            <li key={tool} className={chip}>
              {tool}
            </li>
          ))}
        </ul>
        <ul aria-hidden="true" className="marquee-list marquee-copy">
          {project.stack.map((tool) => (
            <li key={tool} className={chip}>
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </div>,
  ]);
  if (github) {
    rows.push([
      'Last commit',
      <time key="lc" dateTime={github.lastCommit}>
        {formatDay(github.lastCommit)}
      </time>,
    ]);
    if (github.topics.length > 0) {
      rows.push([
        'Topics',
        <ul key="topics" aria-label="GitHub topics" className="flex flex-wrap gap-1.5">
          {github.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-chip bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink"
            >
              {topic}
            </li>
          ))}
        </ul>,
      ]);
    }
  }
  if (counts.length > 0) {
    rows.push([
      'Findings',
      <div key="f" className="flex flex-col gap-2.5">
        <SeverityBar counts={counts} />
        <ul className="flex flex-wrap gap-1.5">
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
        </ul>
      </div>,
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
      <dl className="grid gap-x-8 gap-y-4 px-5 py-5 grid-cols-[minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="label-mono pt-0.5 text-ink-muted">{term}</dt>
            <dd className="min-w-0 text-[0.9375rem] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {github && <p className="px-5 pb-4 text-sm text-ink-muted">From GitHub, refreshed daily.</p>}
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
