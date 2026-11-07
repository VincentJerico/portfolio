import type { TimelineEvent } from '@/content/schema';

export interface YearGroup {
  /** A four-digit year, or "Next" for planned steps. */
  year: string;
  events: TimelineEvent[];
}

/**
 * Groups timeline events by the year their date starts in, keeping the data file's order. Planned
 * steps (kind "next") have no date to sit under, so they form a final "Next" group.
 */
export function groupByYear(events: readonly TimelineEvent[]): YearGroup[] {
  const groups: YearGroup[] = [];
  const next: TimelineEvent[] = [];
  for (const event of events) {
    if (event.kind === 'next') {
      next.push(event);
      continue;
    }
    const year = event.date.slice(0, 4);
    const last = groups.at(-1);
    if (last?.year === year) last.events.push(event);
    else groups.push({ year, events: [event] });
  }
  if (next.length > 0) groups.push({ year: 'Next', events: next });
  return groups;
}
