import Link from 'next/link';
import { ViewTransition } from 'react';
import type { Project } from '@/content/schema';
import { categoryLabel } from '@/lib/labels';
import { Inspectable } from '@/components/bughunt/Inspectable';

/**
 * Projects as an index, one row per suite. The whole row is the report link. On hover or focus a
 * panel sweeps up behind it, the name slides over and the result opens underneath; screens without
 * hover always show the result. The row's name morphs into the report title on navigation.
 */
export function ProjectIndex({
  projects,
  huntPrefix,
}: {
  projects: readonly Project[];
  huntPrefix: string;
}) {
  return (
    <ol className="border-t border-line">
      {projects.map((project) => (
        <li key={project.slug}>
          <Inspectable id={`${huntPrefix}-card-${project.slug}`} label={`${project.name} row`}>
            <div className="index-row relative isolate grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 border-b border-line px-2 py-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto]">
              <span className="pt-1.5 font-mono text-[0.6875rem] text-ink-muted">
                suite {String(project.order).padStart(2, '0')}
              </span>
              <h3 className="index-name min-w-0 text-xl font-semibold break-words sm:text-2xl">
                <Link
                  href={`/projects/${project.slug}`}
                  transitionTypes={['morph']}
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
              <span className="col-start-2 pt-1 font-mono text-[0.6875rem] text-ink-muted sm:col-start-3 sm:row-start-1 sm:pt-2.5">
                {categoryLabel(project.category)}
              </span>
              <div className="index-hook col-start-2 grid sm:col-[2/4]">
                <p
                  data-index-hook
                  className="min-h-0 overflow-hidden text-[0.9375rem] text-ink-muted"
                >
                  {project.hook}
                </p>
              </div>
            </div>
          </Inspectable>
        </li>
      ))}
    </ol>
  );
}
