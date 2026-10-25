'use client';

import { Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function ThemeToggle({ className = '' }: { className?: string }) {
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
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex min-h-11 items-center gap-3 rounded-chip px-2 text-sm text-ink hover:bg-surface-2 ${className}`}
    >
      <Moon aria-hidden="true" className="size-4 text-ink-muted" />
      <span>Dark theme</span>
      <span
        aria-hidden="true"
        className="relative ml-auto h-5 w-9 rounded-full border border-line bg-surface-2 transition-colors not-in-[.light]:border-accent not-in-[.light]:bg-accent"
      >
        <span
          data-switch-knob
          className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-ink-muted transition-transform not-in-[.light]:translate-x-4 not-in-[.light]:bg-bg"
        />
      </span>
    </button>
  );
}
