'use client';

import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getCoverage, getServerCoverage, markVisited, subscribeCoverage } from '@/lib/coverage';
import { isActive } from '@/lib/nav';
import type { RunStatus } from '@/lib/quality';

export interface ExplorerRow {
  href: string;
  label: string;
  spec: string;
  status: RunStatus;
  duration?: string;
}

interface TestExplorerNavProps {
  rows: readonly ExplorerRow[];
  projects: readonly ExplorerRow[];
  summary: string;
  /** Distinguishes the sidebar and drawer copies so ids stay unique. */
  idPrefix: string;
}

const STATUS_TEXT: Record<RunStatus, string> = {
  pass: 'passing',
  fail: 'failing',
  'not-run': 'not run',
};

function StatusDot({ status }: { status: RunStatus }) {
  const tone =
    status === 'pass'
      ? 'bg-pass'
      : status === 'fail'
        ? 'bg-fail'
        : 'border border-ink-muted bg-transparent';
  return <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tone}`} />;
}

function Row({
  row,
  active,
  visited,
  child = false,
  showSpec = !child,
  marker,
}: {
  row: ExplorerRow;
  active: boolean;
  visited: boolean;
  child?: boolean;
  /**
   * The view-transition name of the active-row marker, on the one row that holds it. The marker keeps
   * the same name on every page, so on navigation it glides from the old row to the new one.
   */
  marker?: string;
  /** The spec file name; dropped where the row also carries a folder toggle and room runs out. */
  showSpec?: boolean;
}) {
  return (
    <>
      <span className="sr-only">
        {STATUS_TEXT[row.status]}
        {visited && ', visited'}
      </span>
      <Link
        href={row.href}
        aria-current={active ? 'page' : undefined}
        className={`group relative isolate flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-chip px-2.5 no-underline transition-colors hover:bg-surface-2 ${
          child ? 'text-sm' : 'text-[0.9375rem]'
        }`}
      >
        {marker && (
          <span
            aria-hidden="true"
            data-nav-marker
            className="absolute inset-0 -z-10 rounded-chip bg-surface-2 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-accent"
            style={{ viewTransitionName: marker }}
          />
        )}
        <StatusDot status={row.status} />
        <span className="min-w-0 truncate text-ink-muted group-hover:text-ink group-aria-[current=page]:font-semibold group-aria-[current=page]:text-ink">
          {row.label}
        </span>
        <span
          aria-hidden="true"
          className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[0.6875rem] tracking-tight text-ink-muted"
        >
          {visited && <Check className="size-3 text-accent" />}
          {showSpec && <span className="hidden xl:inline">{row.spec}</span>}
          {row.duration && <span>{row.duration}</span>}
        </span>
      </Link>
    </>
  );
}

/** The site nav styled as a test runner's explorer (spec 4.4 A) with exploration coverage (P1). */
export function TestExplorerNav({ rows, projects, summary, idPrefix }: TestExplorerNavProps) {
  const pathname = usePathname();
  const visited = useSyncExternalStore(subscribeCoverage, getCoverage, getServerCoverage);
  const [folderOpen, setFolderOpen] = useState(() => pathname.startsWith('/projects/'));
  const folderId = `${idPrefix}-project-specs`;

  useEffect(() => {
    markVisited(pathname);
  }, [pathname]);

  const isVisited = (href: string) => visited.some((path) => isActive(path, href));
  const covered = rows.filter((row) => isVisited(row.href)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-2.5">
        <p className="font-mono text-xs font-medium text-ink">portfolio.spec</p>
        <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-muted">{summary}</p>
      </div>
      <nav aria-label="Site">
        <ul className="flex flex-col gap-0.5">
          {rows.map((row) => {
            const isFolder = row.href === '/projects';
            return (
              <li key={row.href}>
                <div className="flex items-center gap-1">
                  <Row
                    row={row}
                    active={isActive(pathname, row.href)}
                    visited={isVisited(row.href)}
                    showSpec={!isFolder}
                    marker={
                      isActive(pathname, row.href) &&
                      !(isFolder && projects.some((project) => project.href === pathname))
                        ? `nav-active-${idPrefix}`
                        : undefined
                    }
                  />
                  {isFolder && (
                    <button
                      type="button"
                      aria-label="Project specs"
                      aria-expanded={folderOpen}
                      aria-controls={folderId}
                      onClick={() => setFolderOpen((open) => !open)}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-chip text-ink-muted hover:bg-surface-2 hover:text-ink"
                    >
                      <ChevronRight
                        aria-hidden="true"
                        className={`size-4 transition-transform ${folderOpen ? 'rotate-90' : ''}`}
                      />
                    </button>
                  )}
                </div>
                {isFolder && (
                  <ul
                    id={folderId}
                    hidden={!folderOpen}
                    className="ml-3.5 border-l border-line pl-1.5"
                  >
                    {projects.map((project) => (
                      <li key={project.href} className="flex">
                        <Row
                          row={project}
                          active={pathname === project.href}
                          visited={visited.includes(project.href)}
                          child
                          marker={pathname === project.href ? `nav-active-${idPrefix}` : undefined}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-1.5 px-2.5">
        <p className="font-mono text-[0.6875rem] text-ink-muted">
          You&apos;ve covered {covered} of {rows.length} pages
        </p>
        {/* Decorative coverage bar; the sentence above carries the numbers. */}
        <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-line">
          <div
            data-coverage-bar
            className="h-full origin-left rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-snap)]"
            style={{ transform: `scaleX(${rows.length ? covered / rows.length : 0})` }}
          />
        </div>
      </div>
    </div>
  );
}
