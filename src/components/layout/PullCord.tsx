'use client';

import { useTheme } from 'next-themes';
import { switchTheme } from '@/lib/theme-switch';
import { useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * A light-pull cord hanging from the top of the page: a tug switches between the light and dark
 * themes. It is the only theme switch from 1024px up (smaller screens use the drawer's toggle). It is
 * a real toggle button for keyboards and screen readers. The cord starts 3rem above the viewport, so
 * a tug pulls more cord into view instead of opening a gap at the top edge. It sways at rest, dips on
 * hover and swings after a tug (globals.css).
 */
export function PullCord() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [tug, setTug] = useState(0);
  const lightOn = resolvedTheme === 'light';

  return (
    <div
      data-print-hide
      className="pointer-events-none fixed -top-12 right-1 z-30 hidden flex-col items-center lg:flex"
    >
      <button
        type="button"
        data-no-press
        aria-pressed={hydrated ? lightOn : undefined}
        onClick={(event) => {
          setTug((n) => n + 1);
          switchTheme(lightOn ? 'dark' : 'light', setTheme, event.currentTarget);
        }}
        className="group pointer-events-auto flex w-8 flex-col items-center rounded-b-chip"
      >
        <span className="sr-only">Light switch</span>
        {/* The sway wraps the cord so a tug (which remounts the cord) never restarts it. */}
        <span aria-hidden="true" className="cord-sway flex flex-col items-center">
          <span
            key={tug}
            data-pull-cord
            className={`pull-cord flex flex-col items-center ${tug ? 'pull-cord-tug' : ''}`}
          >
            <span className="h-40 w-px bg-ink-muted/70" />
            <span className="cord-knob relative size-3 rounded-full border border-ink-muted bg-surface shadow-sm transition-colors group-hover:bg-accent" />
            <span className="h-3 w-1.5 rounded-b-full bg-ink-muted/70" />
          </span>
        </span>
      </button>
    </div>
  );
}
