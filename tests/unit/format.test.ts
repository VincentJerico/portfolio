import { describe, expect, it } from 'vitest';
import type { Finding, Project } from '@/content/schema';
import {
  formatCertDate,
  formatDay,
  formatMonth,
  formatPeriod,
  formatProjectPeriod,
  formatShortMonth,
  formatTimelineDate,
  splitInlineCode,
} from '@/lib/format';
import { categoryLabel, severityCounts } from '@/lib/labels';

describe('dates', () => {
  it('formats months and days', () => {
    expect(formatMonth('2026-08')).toBe('August 2026');
    expect(formatShortMonth('2025-01')).toBe('Jan 2025');
    expect(formatDay('2026-09-03')).toBe('3 Sep 2026');
  });

  it('formats periods, open-ended as Present', () => {
    expect(formatPeriod('2026-09-03')).toBe('3 Sep 2026 – Present');
    expect(formatPeriod('2026-02', '2026-05')).toBe('Feb 2026 – May 2026');
  });

  it('formats timeline dates verbatim-safe', () => {
    expect(formatTimelineDate('2025-01 to 2025-11')).toBe('Jan 2025 – Nov 2025');
    expect(formatTimelineDate('2026')).toBe('2026');
    expect(formatTimelineDate('Next')).toBe('Next');
    expect(formatTimelineDate('2026-09-04')).toBe('4 Sep 2026');
    expect(formatTimelineDate('2026-07')).toBe('Jul 2026');
  });

  it('formats certification dates', () => {
    expect(formatCertDate('2025-01/2025-04')).toBe('Jan – Apr 2025');
    expect(formatCertDate('2026-07')).toBe('Jul 2026');
  });

  it('formats project periods', () => {
    const p = (fields: Partial<Project>) => fields as Project;
    expect(formatProjectPeriod(p({ startDate: '2026-09-28', endDate: '2026-10-20' }))).toBe(
      '28 Sep – 20 Oct 2026',
    );
    expect(formatProjectPeriod(p({ startDate: '2026-10-24', endDate: '2026-10-24' }))).toBe(
      '24 Oct 2026',
    );
    expect(formatProjectPeriod(p({ year: '2026' }))).toBe('2026');
    expect(formatProjectPeriod(p({}))).toBeUndefined();
  });
});

describe('splitInlineCode', () => {
  it('splits backtick spans into code parts', () => {
    expect(splitInlineCode('Waits on `getAnimations()` instead')).toEqual([
      { code: false, text: 'Waits on ' },
      { code: true, text: 'getAnimations()' },
      { code: false, text: ' instead' },
    ]);
  });

  it('leaves text without backticks whole', () => {
    expect(splitInlineCode('plain')).toEqual([{ code: false, text: 'plain' }]);
  });
});

describe('labels', () => {
  it('uses the data-file category wording', () => {
    expect(categoryLabel('api')).toBe('API / Contract');
    expect(categoryLabel('hub')).toBe('Portfolio hub');
  });

  it('counts severities in order and omits zeros', () => {
    const f = (severity: Finding['severity']) => ({ severity }) as Finding;
    expect(severityCounts([f('moderate'), f('critical'), f('moderate'), f('serious')])).toEqual([
      { severity: 'critical', count: 1 },
      { severity: 'serious', count: 1 },
      { severity: 'moderate', count: 2 },
    ]);
  });
});
