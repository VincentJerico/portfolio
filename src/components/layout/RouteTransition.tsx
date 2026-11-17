'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';

/**
 * P5: keyed by pathname, so a page change is an exit/enter, while in-page updates on the same path (the
 * projects filter syncing ?category=) are not animated: an update transition there swallowed keyboard
 * focus and clicks. A page change lifts the old page away and raises the new one in, quickly (.page-exit
 * and .page-enter); links tagged `morph` (a row's name flying into its page title) use the same
 * timing, with the shared name morphing between them. Off under reduced motion.
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
