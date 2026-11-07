'use client';

import { useTheme } from 'next-themes';
import { useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * A light-pull cord hanging from the top of the page: a tug switches between the light and dark
 * themes. It is a real toggle button for keyboards and screen readers, and stays in sync with the
 * sidebar's theme switch because both read next-themes.
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
      className="pointer-events-none fixed top-0 right-1 z-30 hidden flex-col items-center lg:flex"
    >
      <button
        type="button"
        aria-pressed={hydrated ? lightOn : undefined}
        onClick={() => {
          setTug((n) => n + 1);
          setTheme(lightOn ? 'dark' : 'light');
        }}
        className="group pointer-events-auto flex w-8 flex-col items-center rounded-b-chip"
      >
        <span className="sr-only">Light switch</span>
        <span
          key={tug}
          aria-hidden="true"
          data-pull-cord
          className={`pull-cord flex flex-col items-center ${tug ? 'pull-cord-tug' : ''}`}
        >
          <span className="h-20 w-px bg-ink-muted/70" />
          <span className="size-3 rounded-full border border-ink-muted bg-surface shadow-sm transition-colors group-hover:bg-accent" />
          <span className="h-3 w-1.5 rounded-b-full bg-ink-muted/70" />
        </span>
      </button>
    </div>
  );
}
