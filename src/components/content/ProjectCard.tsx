import Link from 'next/link';
import type { Project } from '@/content/schema';
import { categoryLabel } from '@/lib/labels';
import { Chips } from '@/components/ui/Chips';
import { CiBadge } from '@/components/ui/CiBadge';

/** A project shown as a test "suite" (spec 7.1.3). */
export function ProjectCard({ project }: { project: Project }) {
  const suite = String(project.order).padStart(2, '0');
  return (
    <article className="group flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-colors hover:border-accent/60">
      <p className="label-mono flex items-center gap-2 text-ink-muted">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
        Suite {suite} · {categoryLabel(project.category)}
      </p>
      <h3 className="mt-3 font-mono text-base font-medium break-words text-ink">{project.name}</h3>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">{project.summary}</p>
      <p className="mt-3 text-[0.9375rem] font-semibold text-ink">{project.hook}</p>
      <div className="mt-4">
        <Chips items={project.stack} max={4} label={`${project.name} stack`} />
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex min-h-11 items-center font-semibold"
        >
          Read the report<span className="sr-only"> for {project.name}</span>
        </Link>
        {project.repo && (
          <a href={project.repo} className="inline-flex min-h-11 items-center text-sm">
            Repo<span className="sr-only"> for {project.name}</span>
          </a>
        )}
        {project.ciBadge && (
          <span className="ml-auto">
            <CiBadge src={project.ciBadge} href={project.ciUrl} repo={project.name} />
          </span>
        )}
      </div>
    </article>
  );
}
