import { describe, expect, it } from 'vitest';
import { nextSpec, readingOrder } from '@/lib/next-spec';

const order = readingOrder({
  projects: [
    { href: '/projects/a', label: 'a' },
    { href: '/projects/b', label: 'b' },
  ],
  caseStudies: [{ href: '/work/x', label: 'X' }],
  hasClientWork: true,
});

describe('reading order (P2)', () => {
  it('walks overview, projects, reports, client work, case studies, then the rest', () => {
    expect(order.map((s) => s.href)).toEqual([
      '/',
      '/projects',
      '/projects/a',
      '/projects/b',
      '/work',
      '/work/x',
      '/skills',
      '/about',
      '/resume',
      '/quality',
      '/contact',
    ]);
  });

  it('suggests the next page and wraps from Contact to Overview', () => {
    expect(nextSpec(order, '/projects/b')?.href).toBe('/work');
    expect(nextSpec(order, '/contact')?.href).toBe('/');
  });

  it('sends unknown pages to Overview', () => {
    expect(nextSpec(order, '/nope')?.href).toBe('/');
  });

  it('skips client work when no case study is approved', () => {
    const without = readingOrder({ projects: [], caseStudies: [], hasClientWork: false });
    expect(without.some((s) => s.href === '/work')).toBe(false);
  });
});
