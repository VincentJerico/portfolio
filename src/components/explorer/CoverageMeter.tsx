'use client';

import { useSyncExternalStore } from 'react';
import { getCoverage, getServerCoverage, subscribeCoverage } from '@/lib/coverage';
import { isActive } from '@/lib/nav';

/** Exploration coverage for the status bar (P1): how many of the site's pages this visitor opened. */
export function CoverageMeter({ hrefs }: { hrefs: readonly string[] }) {
  const visited = useSyncExternalStore(subscribeCoverage, getCoverage, getServerCoverage);
  const covered = hrefs.filter((href) => visited.some((path) => isActive(path, href))).length;
  return (
    <div className="flex items-center gap-2 px-2">
      <p data-coverage className="text-[0.6875rem] text-ink-muted">
        You&apos;ve covered {covered} of {hrefs.length} pages
      </p>
      {/* Decorative; the sentence carries the numbers. */}
      <div aria-hidden="true" className="h-1 w-16 overflow-hidden rounded-full bg-line">
        <div
          data-coverage-bar
          className="h-full origin-left rounded-full bg-accent transition-transform duration-500 ease-[var(--ease-snap)]"
          style={{ transform: `scaleX(${hrefs.length ? covered / hrefs.length : 0})` }}
        />
      </div>
    </div>
  );
}
