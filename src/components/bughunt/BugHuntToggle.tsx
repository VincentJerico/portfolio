'use client';

import { Bug } from 'lucide-react';
import Link from 'next/link';
import { useBugHunt } from './BugHuntProvider';

type Hunt = ReturnType<typeof useBugHunt>;

/** One hint per page that still hides an unfound bug, with a count when it hides more than one. */
export function huntHints(bugs: Hunt['bugs'], found: Hunt['found']) {
  const unfound = bugs.filter((bug) => !found.includes(bug.id));
  return [...new Set(unfound.map((bug) => bug.route))].map((route) => {
    const onPage = unfound.filter((bug) => bug.route === route);
    return { route, text: `${onPage[0]!.hint}${onPage.length > 1 ? ` (${onPage.length})` : ''}` };
  });
}

/**
 * Bug Hunt switch and counter (spec 4.4 C). In the drawer it stacks with the hints under it; in the
 * desktop status bar (`bar`) the switch and counter sit in a row and the hints move to the hunt banner.
 */
export function BugHuntToggle({ bar = false }: { bar?: boolean }) {
  const { enabled, active, found, bugs, setEnabled } = useBugHunt();
  const hints = bar ? [] : huntHints(bugs, found);

  return (
    <div data-print-hide className={bar ? 'flex items-center gap-1' : 'flex flex-col gap-1'}>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => setEnabled(!enabled)}
        className={`inline-flex min-h-11 items-center rounded-chip hover:bg-surface-2 ${
          bar ? 'gap-1.5 px-2 text-[0.6875rem] text-ink-muted' : 'gap-3 px-2 text-sm text-ink'
        }`}
      >
        <Bug aria-hidden="true" className={bar ? 'size-3.5' : 'size-4 text-ink-muted'} />
        <span>Bug Hunt</span>
        <span
          className={`font-mono text-ink-muted ${bar ? 'text-[0.6875rem]' : 'ml-auto text-xs'}`}
        >
          {enabled ? 'on' : 'off'}
        </span>
      </button>
      {active && (
        <div
          className={`reveal-in rounded-chip border border-warn/50 ${bar ? 'px-2 py-1' : 'px-2.5 py-2'}`}
        >
          <p className="font-mono text-xs text-warn">
            Bugs found{' '}
            <span key={found.length} className="pop-in inline-block">
              {found.length}
            </span>
            /{bugs.length}
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
