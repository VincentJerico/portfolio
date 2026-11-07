import { describe, expect, it } from 'vitest';
import { clockAt, MANILA_UTC_OFFSET_MINUTES } from '../../src/lib/clock';

describe('clockAt', () => {
  it('agrees with Intl for Asia/Manila across a whole day', () => {
    const format = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
    });
    const start = Date.UTC(2026, 0, 1, 0, 0);
    for (let minute = 0; minute < 24 * 60; minute += 7) {
      const date = new Date(start + minute * 60_000);
      expect(clockAt(date, MANILA_UTC_OFFSET_MINUTES)).toBe(format.format(date).toLowerCase());
    }
  });

  it('shows midnight and noon as 12', () => {
    expect(clockAt(new Date(Date.UTC(2026, 5, 1, 16, 5)), MANILA_UTC_OFFSET_MINUTES)).toBe(
      '12:05 am',
    );
    expect(clockAt(new Date(Date.UTC(2026, 5, 1, 4, 0)), MANILA_UTC_OFFSET_MINUTES)).toBe(
      '12:00 pm',
    );
  });
});
