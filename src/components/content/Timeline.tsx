import Link from 'next/link';
import type { TimelineEvent } from '@/content/schema';
import { formatTimelineDate } from '@/lib/format';

/** The timeline as a plain ruled list (C51): the date in mono, then what happened. */
export function Timeline({ events }: { events: readonly TimelineEvent[] }) {
  return (
    <ol className="border-t border-line">
      {events.map((event) => (
        <li
          key={`${event.date}-${event.title}`}
          className="grid gap-x-6 gap-y-1 border-b border-line py-3 sm:grid-cols-[9rem_minmax(0,1fr)]"
        >
          <p className="label-mono pt-0.5 text-ink-muted">{formatTimelineDate(event.date)}</p>
          <p className="text-ink">
            {event.href ? (
              <Link href={event.href} className="hit-area text-ink hover:text-accent">
                {event.title}
              </Link>
            ) : (
              event.title
            )}
            {event.kind === 'next' && <span className="label-mono ml-2 text-ink-muted">next</span>}
          </p>
        </li>
      ))}
    </ol>
  );
}
