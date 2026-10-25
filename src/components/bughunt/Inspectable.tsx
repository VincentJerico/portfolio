'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBugHunt } from './BugHuntProvider';

interface InspectableProps {
  id: string;
  /** What the Inspect button refers to, e.g. "Run summary heading". */
  label: string;
  /** Replacement shown on screen while hunting, when this element is a planted bug. */
  planted?: ReactNode;
  /** Extra classes applied on screen while hunting, when this element is a planted bug. */
  plantedClassName?: string;
  as?: 'div' | 'span';
  className?: string;
  children: ReactNode;
}

/**
 * Any element a Bug Hunt player can inspect. Many clean elements are inspectable so the planted ones
 * aren't given away by focus order. Outside the hunt it renders its children untouched; in print the
 * true children always show.
 */
export function Inspectable({
  id,
  label,
  planted,
  plantedClassName = '',
  as: As = 'div',
  className = '',
  children,
}: InspectableProps) {
  const { active, isPlanted, inspect } = useBugHunt();
  const showPlanted = active && isPlanted(id);

  // Inline hosts (buttons, links) get their Inspect button beside them, so it never covers or
  // steals taps from the control; block hosts get it pinned to the top-right corner.
  const inline = As === 'span';
  return (
    <As
      data-hunt-id={id}
      className={`relative ${inline && active ? 'inline-flex items-center gap-1.5' : ''} ${className} ${showPlanted ? plantedClassName : ''}`}
    >
      {showPlanted && planted !== undefined ? (
        <>
          <span className="hunt-screen">{planted}</span>
          <span className="hunt-print">{children}</span>
        </>
      ) : (
        children
      )}
      {active && (
        <button
          type="button"
          data-hunt-inspect
          data-print-hide
          aria-label={`Inspect ${label}`}
          onClick={(event) => inspect(id, event.currentTarget)}
          className={`${inline ? '' : 'absolute -top-3 right-0'} z-10 inline-flex min-h-6 items-center gap-1 rounded-chip border border-warn/60 bg-surface px-1.5 font-mono text-[0.6875rem] text-warn shadow-sm hover:bg-surface-2 pointer-coarse:min-h-11`}
        >
          <Search aria-hidden="true" className="size-3" />
          Inspect
        </button>
      )}
    </As>
  );
}
