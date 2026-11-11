'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';

/**
 * P5: keyed by pathname, so a page change is an exit/enter, while in-page updates on the same path (the
 * projects filter syncing ?category=) are not animated: an update transition there swallowed keyboard
 * focus and clicks. A page change fades the old page out and raises the new one in (.page-exit and
 * .page-enter) while the test-runner panel (RouteRunner) covers it; links tagged `morph` (a project
 * flying into its report header) skip the runner, so the morph stays the focus. Off under reduced
 * motion.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition
      key={pathname}
      update="none"
      enter={{ morph: 'page-enter', default: 'page-enter' }}
      exit={{ morph: 'page-exit', default: 'page-exit' }}
    >
      {children}
    </ViewTransition>
  );
}
