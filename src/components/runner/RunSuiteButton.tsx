'use client';

import { Play } from 'lucide-react';
import { openRunner } from '@/lib/runner-store';

/** Opens the page's single test run; the runner (and axe-core) load only then. */
export function RunSuiteButton({
  className = '',
  iconOnly = false,
}: {
  className?: string;
  /** Just the play icon, with the label as its name and tooltip (the minimal status bar). */
  iconOnly?: boolean;
}) {
  async function start(button: HTMLButtonElement) {
    // A modal (the mobile menu drawer) would make the page inert, and axe skips inert content.
    document
      .querySelectorAll('dialog')
      .forEach((dialog) => dialog.matches(':modal') && dialog.close());
    // Let the browser drop the closed dialog's inertness before anything scans the page.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    openRunner(button);
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        data-tip="Run tests on this page"
        onClick={(event) => void start(event.currentTarget)}
        className={`tip inline-flex size-11 items-center justify-center rounded-chip text-ink-muted hover:bg-surface-2 hover:text-ink ${className}`}
      >
        <Play aria-hidden="true" className="size-4" />
        <span className="sr-only">Run tests on this page</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(event) => void start(event.currentTarget)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-chip px-2.5 text-sm font-medium text-accent hover:bg-surface-2 ${className}`}
    >
      <Play aria-hidden="true" className="size-4" />
      Run tests on this page
    </button>
  );
}
