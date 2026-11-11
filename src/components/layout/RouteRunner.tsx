'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { RunStatus } from '@/lib/quality';

export interface RunnerSpec {
  href: string;
  spec: string;
  status: RunStatus;
}

const STAMP: Record<RunStatus, string> = { pass: 'PASS', fail: 'FAIL', 'not-run': 'NOT RUN' };

// Whether the click that started the current navigation was on a project morph link. A module
// variable, not a ref: it is read while rendering the navigation's commit.
let lastClickMorph = false;

/**
 * Changing page runs the next page as a spec: a panel slides up showing the page's spec file and a
 * progress line, stamps the route's real CI result from the quality report, then lifts away onto the
 * new page (globals.css). It joins the navigation's view transition, so it covers the change itself.
 * Project morph links (`data-morph`) keep their morph instead. Decorative, pointer-transparent, and
 * never shown under reduced motion.
 */
export function RouteRunner({ specs }: { specs: RunnerSpec[] }) {
  const pathname = usePathname();
  const [run, setRun] = useState<{ key: number; spec: RunnerSpec } | null>(null);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      lastClickMorph = Boolean((event.target as Element | null)?.closest?.('a[data-morph]'));
    };
    // Back and forward have no click: they always run the spec.
    const onPop = () => {
      lastClickMorph = false;
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Render-time update on navigation: the panel must be in the same commit as the new page so the
  // view transition captures it. The first render never runs it (the path has not changed).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spec = specs.find((item) => item.href === pathname);
    if (!reduced && !lastClickMorph && spec) {
      setRuns(runs + 1);
      setRun({ key: runs + 1, spec });
    }
  }

  // Removes the panel once its lift has finished. animationend is the usual signal; the timer covers
  // browsers that skip it (WebKit did in CI).
  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setRun(null), 1500);
    return () => window.clearTimeout(id);
  }, [run]);

  if (!run) return null;
  return (
    <div
      key={run.key}
      data-route-runner
      aria-hidden="true"
      data-print-hide
      className="route-runner"
      onAnimationEnd={(event) => {
        if (event.animationName === 'runner-lift') setRun(null);
      }}
    >
      <p className="font-mono text-sm text-ink-muted">
        <span className="text-accent">$</span> <span className="text-ink">{run.spec.spec}</span> ·
        running
      </p>
      <div className="route-runner-bar">
        <i />
      </div>
      <p
        className={`route-runner-stamp font-mono text-sm font-semibold ${run.spec.status === 'pass' ? 'text-pass' : run.spec.status === 'fail' ? 'text-fail' : 'text-ink-muted'}`}
      >
        {STAMP[run.spec.status]}
      </p>
    </div>
  );
}
