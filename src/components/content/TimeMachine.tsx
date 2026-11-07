import type { TimelineEvent } from '@/content/schema';
import { groupByYear } from '@/lib/timeline-years';
import { Timeline } from './Timeline';

/**
 * The timeline as a time machine: each year gets a huge extruded numeral that stays pinned while its
 * events scroll past, then rolls up out of view as the next year arrives. The numeral is decorative;
 * an h3 names each year for screen readers.
 */
export function TimeMachine({ events }: { events: readonly TimelineEvent[] }) {
  return (
    <div className="time-machine relative flex flex-col gap-12">
      {groupByYear(events).map((group) => (
        <div
          key={group.year}
          data-year-group={group.year}
          className="grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,15rem)_1fr]"
        >
          <div className="md:sticky md:top-10 md:self-start">
            <h3 className="sr-only">{group.year}</h3>
            <div aria-hidden="true" className="tm-year-window">
              <p className="tm-year">{group.year}</p>
            </div>
          </div>
          <div className="md:pt-6">
            <Timeline events={group.events} huntPrefix="about-timeline" />
          </div>
        </div>
      ))}
    </div>
  );
}
