'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';

/**
 * P5: keyed by pathname, so a page change is an exit/enter, while in-page updates on the same path (the
 * projects filter syncing ?category=) are not animated: an update transition there swallowed keyboard
 * focus and clicks. A page change is a curtain: the old page lifts away and the new one is revealed
 * from the bottom behind an accent band (.page-curtain-*). Links tagged `morph` (a project's name
 * flying into its report title) keep the quieter fade, so the morph stays the focus. Off under
 * reduced motion.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition
      key={pathname}
      update="none"
      enter={{ morph: 'page-enter', default: 'page-curtain-in' }}
      exit={{ morph: 'page-exit', default: 'page-curtain-out' }}
    >
      {children}
    </ViewTransition>
  );
}
