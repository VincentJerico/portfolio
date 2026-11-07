'use client';

import { ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';
const INTERVAL_MS = 2600;
const RINGS = 9;

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia(REDUCED);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A spiral-bound desk calendar that flips through the areas Vincent tests. Screen readers get the
 * whole list once as static text; the card itself is decorative. It turns a page every few seconds
 * until paused (WCAG 2.2.2), never on its own under reduced motion, and Next always works.
 */
export function FlipCard({ lead, words }: { lead: string; words: string[] }) {
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rotating = !reduced && !paused && words.length > 1;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % words.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [rotating, words.length]);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      <p className="sr-only" data-testid="flip-card-text">
        {lead} {words.join(', ')}.
      </p>
      <p aria-hidden="true" className="text-2xl font-semibold text-ink-muted lg:text-3xl">
        {lead}
      </p>
      <div aria-hidden="true" data-flip-card className="relative [perspective:700px]">
        <div className="flex justify-around px-3" data-flip-rings>
          {Array.from({ length: RINGS }, (_, i) => (
            <span key={i} className="flip-ring" />
          ))}
        </div>
        <div className="relative -mt-1.5 min-w-[13rem] rounded-card border border-line bg-surface px-5 pt-4 pb-3 shadow-[0_6px_0_-2px_var(--border),0_12px_24px_-12px_rgb(0_0_0/0.5)]">
          <span
            key={index}
            data-flip-word
            className="flip-page block text-2xl font-bold [font-stretch:85%] text-ink lg:text-3xl"
          >
            {words[index]}
          </span>
          <span className="absolute right-3 bottom-1.5 font-mono text-[0.625rem] text-ink-muted">
            {pad(index + 1)} / {pad(words.length)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!reduced && (
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="press inline-flex size-11 items-center justify-center rounded-chip text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            {paused ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
            <span className="sr-only">Pause</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % words.length)}
          className="press inline-flex size-11 items-center justify-center rounded-chip text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
          <span className="sr-only">Next area</span>
        </button>
      </div>
    </div>
  );
}
