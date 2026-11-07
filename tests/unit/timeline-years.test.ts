import { describe, expect, it } from 'vitest';
import type { TimelineEvent } from '@/content/schema';
import { groupByYear } from '@/lib/timeline-years';

const event = (date: string, title: string, kind: TimelineEvent['kind'] = 'work') =>
  ({ date, title, kind, status: 'verified' }) as TimelineEvent;

describe('groupByYear', () => {
  it('groups by the starting year in data order', () => {
    const groups = groupByYear([
      event('2025-01 to 2025-11', 'a'),
      event('2025-04', 'b'),
      event('2026-02', 'c'),
    ]);
    expect(groups.map((g) => [g.year, g.events.map((e) => e.title)])).toEqual([
      ['2025', ['a', 'b']],
      ['2026', ['c']],
    ]);
  });

  it('puts planned steps in a final Next group', () => {
    const groups = groupByYear([event('2026', 'next step', 'next'), event('2026-03', 'done')]);
    expect(groups.map((g) => g.year)).toEqual(['2026', 'Next']);
    expect(groups.at(-1)!.events[0]!.title).toBe('next step');
  });

  it('returns nothing for no events', () => {
    expect(groupByYear([])).toEqual([]);
  });
});
