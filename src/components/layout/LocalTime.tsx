'use client';

import { useEffect, useState } from 'react';

const TICK_MS = 30_000;

/**
 * The visitor sees Vincent's local time, ticking by the minute. The first time-zone formatter loads
 * the browser's zone data, which cost about 17 ms of main-thread time during hydration (measured under
 * 4x CPU throttling), so the clock starts once the browser is idle, in its own small task. Until then,
 * and on the server, the slot is empty but width-reserved, so nothing shifts when the time fills in.
 */
export function LocalTime({ timeZone, place }: { timeZone: string; place: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    let interval = 0;
    const tick = (format: Intl.DateTimeFormat) => setTime(format.format(new Date()).toLowerCase());
    const start = () => {
      const format = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
      });
      tick(format);
      interval = window.setInterval(() => tick(format), TICK_MS);
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 1200);
    return () => {
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      window.clearInterval(interval);
    };
  }, [timeZone]);

  return (
    <p data-local-time className="font-mono text-[0.6875rem] text-ink-muted">
      Local time <span className="inline-block min-w-[7ch] text-ink tabular-nums">{time}</span> ·{' '}
      {place}
    </p>
  );
}
