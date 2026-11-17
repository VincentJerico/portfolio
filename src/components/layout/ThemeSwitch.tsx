'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { switchTheme } from '@/lib/theme-switch';

const subscribe = () => () => {};

/**
 * The theme switch (C51): a small "Dark" toggle in the top bar. aria-pressed means the dark theme is
 * on; its dot fills from CSS (the `.dark` class next-themes sets before paint), so it is right before
 * hydration too. Switching floods the page with the new theme from the button (lib/theme-switch.ts).
 */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is unknown during server render; only expose state once hydrated.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-pressed={hydrated ? isDark : undefined}
      onClick={(event) => switchTheme(isDark ? 'light' : 'dark', setTheme, event.currentTarget)}
      className="inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[0.8125rem] text-ink hover:text-accent"
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full border border-current in-[.dark]:bg-current"
      />
      Dark<span className="sr-only"> theme</span>
    </button>
  );
}
