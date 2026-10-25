'use client';

import { useBugHunt } from './BugHuntProvider';

/** Banner while hunting (spec 4.4 C), with the completion card at 5 of 5. */
export function HuntBanner({ email }: { email: string }) {
  const { active, found, bugs, setEnabled } = useBugHunt();
  if (!active) return null;
  const done = found.length >= bugs.length;

  return (
    <section
      aria-label="Bug Hunt"
      data-print-hide
      className="mb-10 rounded-card border border-warn/60 bg-surface p-4 lg:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink">
          Bug Hunt mode: {bugs.length} bugs are planted on this site. Find them.
        </p>
        <button
          type="button"
          onClick={() => setEnabled(false)}
          className="inline-flex min-h-11 items-center rounded-chip border border-line px-3 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          Turn off
        </button>
      </div>
      {done && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="font-display text-2xl text-ink">
            {bugs.length} of {bugs.length} found.
          </p>
          <p className="mt-2 text-ink-muted">
            Nice hunting. Each of these has a test that would have caught it, and writing those
            tests is the job I do. If that is the kind of tester you need, let&apos;s talk.
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-3 inline-flex min-h-11 items-center rounded-chip bg-accent px-4 font-semibold text-bg no-underline"
          >
            Email me
          </a>
        </div>
      )}
    </section>
  );
}
