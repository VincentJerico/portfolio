import { describe, expect, it } from 'vitest';
import { approvedCaseStudies, visible } from '@/lib/content';
import type { CaseStudy } from '@/content/schema';

const statuses = ['verified', 'confirm', 'todo', 'approval'] as const;

describe('visible', () => {
  it('keeps only verified items', () => {
    const items = statuses.map((status) => ({ id: status, status }));
    expect(visible(items).map((item) => item.id)).toEqual(['verified']);
  });
});

describe('approvedCaseStudies', () => {
  const base: CaseStudy = {
    slug: 'a',
    title: 'A',
    industry: 'i',
    system: 's',
    activities: [],
    outcomes: [],
    method: [],
    approved: true,
    status: 'verified',
    currentlyTesting: false,
  };

  it('drops unapproved and non-verified case studies (self-test)', () => {
    const result = approvedCaseStudies([
      base,
      { ...base, slug: 'unapproved', approved: false },
      { ...base, slug: 'pending', status: 'approval' },
    ]);
    expect(result.map((item) => item.slug)).toEqual(['a']);
  });
});
