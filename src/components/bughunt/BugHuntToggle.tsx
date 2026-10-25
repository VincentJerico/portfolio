'use client';

import { Bug } from 'lucide-react';
import Link from 'next/link';
import { useBugHunt } from './BugHuntProvider';

/** Sidebar switch, counter and hints (spec 4.4 C). */
export function BugHuntToggle() {
  const { enabled, active, found, bugs, setEnabled } = useBugHunt();
  const unfound = bugs.filter((bug) => !found.includes(bug.id));
  const hints = [...new Set(unfound.map((bug) => bug.route))].map((route) => {
    const onPage = unfound.filter((bug) => bug.route === route);
    return { route, text: `${onPage[0]!.hint}${onPage.length > 1 ? ` (${onPage.length})` : ''}` };
  });

  return (
    <div data-print-hide className="flex flex-col gap-1">
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => setEnabled(!enabled)}
        className="inline-flex min-h-11 items-center gap-3 rounded-chip px-2 text-sm text-ink hover:bg-surface-2"
      >
        <Bug aria-hidden="true" className="size-4 text-ink-muted" />
        <span>Bug Hunt</span>
        <span className="ml-auto font-mono text-xs text-ink-muted">{enabled ? 'on' : 'off'}</span>
      </button>
      {active && (
        <div className="rounded-chip border border-warn/50 px-2.5 py-2">
          <p className="font-mono text-xs text-warn">
            Bugs found {found.length}/{bugs.length}
          </p>
          {hints.length > 0 && (
            <ul aria-label="Hints" className="mt-1.5 flex flex-col">
              {hints.map((hint) => (
                <li key={hint.route}>
                  <Link
                    href={hint.route}
                    className="inline-flex min-h-6 items-center text-xs pointer-coarse:min-h-11"
                  >
                    {hint.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
