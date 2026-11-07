import Link from 'next/link';
import { ViewTransition } from 'react';
import type { Project } from '@/content/schema';
import { categoryLabel } from '@/lib/labels';
import { CiBadge } from '@/components/ui/CiBadge';
import { Inspectable } from '@/components/bughunt/Inspectable';

/**
 * A test suite as a door. The front panel carries the label plate, name, what the suite is and its
 * stack; on hover or focus it swings open on its left hinge to show the result behind it. One stretched link covers the whole
 * door, so it opens wherever it is clicked; the panel itself ignores the pointer. On touch screens,
 * which have no hover, the front shows the result in place of the summary. Back and front share one grid cell, so the
 * door is as tall as whichever side holds more and nothing behind it can spill out below.
 */
export function SuiteDoor({ project }: { project: Project }) {
  const suite = String(project.order).padStart(2, '0');
  return (
    <Inspectable
      id={`projects-card-${project.slug}`}
      label={`${project.name} card`}
      className="h-full"
      plantedClassName="translate-x-[3px] print:translate-x-0"
    >
      <article className="suite-door group relative grid h-full min-h-[16rem] [perspective:1400px]">
        <div className="door-back col-start-1 row-start-1 flex min-w-0 flex-col rounded-card border border-line bg-secondary py-5 pr-5 pl-[24%]">
          <p className="label-mono text-ink-muted">Result</p>
          <p className="mt-3 text-[0.9375rem] font-semibold text-ink">{project.hook}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex min-h-11 items-center font-semibold after:absolute after:inset-0 after:content-['']"
            >
              Read the report<span className="sr-only"> for {project.name}</span>
            </Link>
            {project.repo && (
              <a
                href={project.repo}
                className="door-extra relative inline-flex min-h-11 items-center text-sm"
              >
                Repo<span className="sr-only"> for {project.name}</span>
              </a>
            )}
            {project.ciBadge && (
              <span className="door-extra relative ml-auto">
                <CiBadge src={project.ciBadge} href={project.ciUrl} repo={project.name} />
              </span>
            )}
          </div>
        </div>
        <div className="door-panel pointer-events-none relative z-10 col-start-1 row-start-1 flex min-w-0 flex-col rounded-card border border-line bg-surface py-5 pr-10 pl-5 shadow-card">
          <p className="door-plate self-start rounded-chip border border-line bg-surface-2 px-2 py-1 font-mono text-[0.6875rem] text-ink-muted">
            suite {suite} · {categoryLabel(project.category)}
          </p>
          <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
            <h3 className="mt-5 font-mono text-lg font-medium break-words text-ink">
              {project.name}
            </h3>
          </ViewTransition>
          <p className="door-summary mt-3 text-sm text-ink-muted">{project.summary}</p>
          <p aria-hidden="true" className="door-hook-touch mt-3 text-[0.9375rem] text-ink">
            {project.hook}
          </p>
          <ul aria-label={`${project.name} stack`} className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {project.stack.slice(0, 3).map((tool) => (
              <li
                key={tool}
                className="rounded-chip border border-line px-2 py-0.5 font-mono text-xs text-ink-muted"
              >
                {tool}
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="door-handle" />
        </div>
      </article>
    </Inspectable>
  );
}
