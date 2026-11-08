'use client';

import { useEffect, useState } from 'react';
import { clockAt } from '@/lib/clock';

const TICK_MS = 30_000;

/**
 * The visitor sees Vincent's local time, ticking by the minute. The clock starts once the browser is
 * idle, after hydration. Until then, and on the server, the slot is empty but width-reserved, so
 * nothing shifts when the time fills in.
 */
export function LocalTime({
  utcOffsetMinutes,
  place,
}: {
  utcOffsetMinutes: number;
  place: string;
}) {
  const [time, setTime] = useState('');

  useEffect(() => {
    let interval = 0;
    const tick = () => setTime(clockAt(new Date(), utcOffsetMinutes));
    const start = () => {
      tick();
      interval = window.setInterval(tick, TICK_MS);
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
  }, [utcOffsetMinutes]);

  return (
    <p data-local-time className="font-mono text-[0.6875rem] text-ink-muted">
      Local time <span className="inline-block min-w-[7ch] text-ink tabular-nums">{time}</span> ·{' '}
      {place}
    </p>
  );
}
