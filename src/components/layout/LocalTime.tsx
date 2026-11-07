'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

/**
 * The visitor sees Vincent's local time, ticking by the minute. The server renders an empty,
 * width-reserved slot, so hydration never mismatches and nothing shifts when the time fills in.
 */
export function LocalTime({ timeZone, place }: { timeZone: string; place: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })
        .format(new Date())
        .toLowerCase(),
    () => '',
  );
  return (
    <p data-local-time className="font-mono text-[0.6875rem] text-ink-muted">
      Local time <span className="inline-block min-w-[7ch] text-ink tabular-nums">{time}</span> ·{' '}
      {place}
    </p>
  );
}
