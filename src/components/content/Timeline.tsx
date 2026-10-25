import Link from 'next/link';
import type { TimelineEvent } from '@/content/schema';
import { Inspectable } from '@/components/bughunt/Inspectable';
import { formatTimelineDate } from '@/lib/format';
import { githubSlug } from '@/lib/slug';

// HUNT-03 (Bug Hunt only): an event dated in the future.
const PLANTED_DATES: Record<string, string> = {
  'about-timeline-published-performance-testing-k6': '24 Oct 2027',
};

export function Timeline({
  events,
  huntPrefix,
}: {
  events: readonly TimelineEvent[];
  huntPrefix: string;
}) {
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
          <Inspectable
            id={`${huntPrefix}-${githubSlug(event.title)}`}
            label={`${event.title} timeline entry`}
            planted={
              PLANTED_DATES[`${huntPrefix}-${githubSlug(event.title)}`] && (
                <p className="label-mono text-ink-muted">
                  {PLANTED_DATES[`${huntPrefix}-${githubSlug(event.title)}`]}
                </p>
              )
            }
          >
            <p className="label-mono text-ink-muted">{formatTimelineDate(event.date)}</p>
          </Inspectable>
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
