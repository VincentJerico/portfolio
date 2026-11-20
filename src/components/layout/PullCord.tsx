'use client';

import { useTheme } from 'next-themes';
import { useState, useSyncExternalStore } from 'react';
import { switchTheme } from '@/lib/theme-switch';

const subscribe = () => () => {};

/**
 * The pull cord (C53): a light-pull hanging from the top-right corner, the theme switch from 1024 px up
 * (the top bar's "Dark" button takes over below). It is the same control as that button, a real
 * toggle named "Dark theme" whose aria-pressed means dark, so keyboards and screen readers meet one
 * switch at every width. It settles from a short swing on arrival, dips on hover, and a tug stretches
 * it, springs back and swings it to rest while the new theme floods out from the knob (globals.css).
 * It starts 3rem above the viewport, so a tug pulls more cord into view.
 */
export function PullCord() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [tug, setTug] = useState(0);
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="pull-cord-hang">
      <button
        type="button"
        data-no-press
        aria-pressed={hydrated ? isDark : undefined}
        onClick={(event) => {
          setTug((n) => n + 1);
          const knob = event.currentTarget.querySelector<HTMLElement>('.cord-knob');
          switchTheme(isDark ? 'light' : 'dark', setTheme, knob ?? event.currentTarget);
        }}
        className="pull-cord-button"
      >
        <span className="sr-only">Dark theme</span>
        {/* The arrival swing wraps the cord, so a tug (which remounts the cord) never restarts it. */}
        <span aria-hidden="true" className="cord-sway">
          <span key={tug} data-pull-cord className={`pull-cord${tug ? ' pull-cord-tug' : ''}`}>
            <span className="cord-line" />
            <span className="cord-knob" />
            <span className="cord-tip" />
          </span>
        </span>
      </button>
    </div>
  );
}
