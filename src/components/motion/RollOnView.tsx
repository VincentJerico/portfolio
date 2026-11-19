'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A list whose items are marked `data-roll` once each is mostly in view, which starts its odometer
 * digits rolling (C52, move 4). Until then (and without JavaScript) the digits rest on the real value.
 */
export function RollOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.roll = '';
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.6 },
    );
    for (const item of list.children) observer.observe(item);
    return () => observer.disconnect();
  }, []);
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
