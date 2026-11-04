'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';

/**
 * P5: keyed by pathname, so a page change is an exit/enter that cross-fades, while in-page updates on
 * the same path (the projects filter syncing ?category=) are not animated: an update transition there
 * swallowed keyboard focus and clicks. Off under reduced motion (globals.css).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} update="none">
      {children}
    </ViewTransition>
  );
}
