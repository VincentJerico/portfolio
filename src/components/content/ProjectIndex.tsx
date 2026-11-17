import Link from 'next/link';
import { ViewTransition, type CSSProperties } from 'react';
import type { Project } from '@/content/schema';
import { categoryLabel } from '@/lib/labels';
import { Inspectable } from '@/components/bughunt/Inspectable';

/**
 * Featured projects as a suite run (C47): one row per suite on a rail. As a row reaches the middle of
 * the screen its dot fills, its status steps from queued to running to done, and its result opens
 * underneath; the rail draws down and a counter reads "N of 6 run" (globals.css, .suite-run). The
 * status says "done", never PASS: the data has no live CI result per project. Statuses, dots and the
 * counter are decorative; the list reads as plain links. Without scroll timelines, or under reduced
 * motion, every row shows done with its result open. On navigation the suite number, category and
 * name each morph into their places in the report header.
 */
export function ProjectIndex({
  projects,
  huntPrefix,
}: {
  projects: readonly Project[];
  huntPrefix: string;
}) {
  const total = projects.length;
  return (
    <div className="suite-run" style={{ '--n': total, '--done': total } as CSSProperties}>
      <p aria-hidden="true" className="suite-count label-mono mb-4 text-right text-ink-muted" />
      <ol className="suite-rail">
        {projects.map((project, i) => (
          <li key={project.slug} className="suite-item" style={{ '--i': i } as CSSProperties}>
            <Inspectable id={`${huntPrefix}-card-${project.slug}`} label={`${project.name} row`}>
              <div className="suite-row relative isolate grid grid-cols-[1.75rem_4.5rem_minmax(0,1fr)] items-start gap-x-3 py-5 pr-2 sm:grid-cols-[1.75rem_5rem_minmax(0,1fr)_auto_6.5rem]">
                <span aria-hidden="true" className="suite-dot mt-2 justify-self-center" />
                <ViewTransition name={`project-suite-${project.slug}`} share="morph" default="none">
                  <span className="self-start pt-1.5 font-mono text-[0.6875rem] text-ink-muted">
                    suite {String(project.order).padStart(2, '0')}
                  </span>
                </ViewTransition>
                <h3 className="suite-name min-w-0 text-xl font-semibold break-words sm:text-2xl">
                  <Link
                    href={`/projects/${project.slug}`}
                    transitionTypes={['morph']}
                    data-morph
                    className="text-ink no-underline after:absolute after:inset-0 after:content-['']"
                  >
                    <ViewTransition
                      name={`project-title-${project.slug}`}
                      share="morph"
                      default="none"
                    >
                      <span>{project.name}</span>
                    </ViewTransition>
                  </Link>
                </h3>
                <ViewTransition name={`project-cat-${project.slug}`} share="morph" default="none">
                  <span className="col-start-3 self-start pt-1 font-mono text-[0.6875rem] text-ink-muted sm:col-start-4 sm:row-start-1 sm:pt-2.5">
                    {categoryLabel(project.category)}
                  </span>
                </ViewTransition>
                <span
                  aria-hidden="true"
                  className="suite-status col-start-3 mt-1 grid font-mono text-[0.6875rem] tracking-[0.04em] uppercase sm:col-start-5 sm:row-start-1 sm:mt-2 sm:justify-self-end"
                >
                  <span data-status-step="queued" className="text-ink-muted">
                    queued
                  </span>
                  <span data-status-step="running" className="text-warn">
                    running
                  </span>
                  <span data-status-step="done" className="text-accent">
                    done
                  </span>
                </span>
                <p
                  data-index-hook
                  className="suite-hook col-start-3 mt-2 text-[0.9375rem] text-ink-muted sm:col-[3/6]"
                >
                  {project.hook}
                </p>
              </div>
            </Inspectable>
          </li>
        ))}
      </ol>
    </div>
  );
}
