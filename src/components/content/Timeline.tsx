import Link from 'next/link';
import type { TimelineEvent } from '@/content/schema';
import { formatTimelineDate } from '@/lib/format';

export function Timeline({ events }: { events: readonly TimelineEvent[] }) {
  return (
    <ol className="relative border-l border-line">
      {events.map((event) => (
        <li key={`${event.date}-${event.title}`} className="relative pb-6 pl-6 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute top-2 -left-[5px] size-2.5 rounded-full border-2 border-bg ${
              event.kind === 'next' ? 'bg-ink-muted' : 'bg-accent'
            }`}
          />
          <p className="label-mono text-ink-muted">{formatTimelineDate(event.date)}</p>
          <p className="mt-1 text-ink">
            {event.href ? (
              <Link
                href={event.href}
                className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent"
              >
                {event.title}
              </Link>
            ) : (
              event.title
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}
