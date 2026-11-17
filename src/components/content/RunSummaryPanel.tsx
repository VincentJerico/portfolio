import type { Project } from '@/content/schema';
import { CiBadge } from '@/components/ui/CiBadge';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { formatDay, formatProjectPeriod } from '@/lib/format';
import type { RepoMeta } from '@/lib/github';
import { severityCounts } from '@/lib/labels';
import { InlineCode } from '@/components/ui/InlineCode';

/**
 * A report's facts (spec 7.3.3, restyled for C51): a ruled list of target, period, commits, tools and
 * findings, with the CI badge and the repo and live links. Finding counts open their tickets.
 */
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
  rows.push([
    'Tools',
    <ul
      key="tools"
      aria-label={`${project.name} tools`}
      className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.8125rem]"
    >
      {project.stack.map((tool) => (
        <li key={tool}>{tool}</li>
      ))}
    </ul>,
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
        <ul
          key="topics"
          aria-label="GitHub topics"
          className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.8125rem]"
        >
          {github.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>,
      ]);
    }
  }
  if (counts.length > 0) {
    rows.push([
      'Findings',
      <ul key="f" className="flex flex-wrap gap-x-5">
        {counts.map(({ severity, count }) => (
          <li key={severity}>
            <a
              href={`#ticket-${project.findings.find((f) => f.severity === severity)!.id}`}
              data-open-severity={severity}
              className="inline-flex min-h-11 items-center no-underline hover:underline"
            >
              <SeverityChip severity={severity} count={count} />
            </a>
          </li>
        ))}
      </ul>,
    ]);
  }

  return (
    <section aria-labelledby="run-summary-heading" className="border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="run-summary-heading" className="label-mono text-ink-muted">
          Summary{project.team && ' · team project'}
        </h2>
        {project.ciBadge && (
          <CiBadge src={project.ciBadge} href={project.ciUrl} repo={project.name} />
        )}
      </div>
      <dl className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="label-mono pt-0.5 text-ink-muted">{term}</dt>
            <dd className="min-w-0 text-[0.9375rem] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {github && <p className="mt-3 text-sm text-ink-muted">From GitHub, refreshed daily.</p>}
      {(project.repo || project.liveUrl) && (
        <div className="mt-4 flex flex-wrap gap-x-6">
          {project.repo && (
            <a href={project.repo} className="inline-flex min-h-11 items-center font-mono text-sm">
              Repo<span className="sr-only">: {project.name} on GitHub</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              className="inline-flex min-h-11 items-center font-mono text-sm"
            >
              Live site<span className="sr-only">: {project.name}</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
