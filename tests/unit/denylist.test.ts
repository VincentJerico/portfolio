import { describe, expect, it } from 'vitest';
import { allContent } from '@/content';
import { denylistProblems, findDenied } from '@/lib/strings';
import { loadDenylist } from '../helpers/denylist';
import { plantedContent } from '../fixtures/planted-content';

describe('client denylist', () => {
  const deny = loadDenylist();

  it('is not empty and has one usable term per line', () => {
    expect(deny.length).toBeGreaterThan(0);
    // Messages name term positions only, never the private terms.
    expect(denylistProblems(deny)).toEqual([]);
  });

  it('matches nothing in the site content', () => {
    // Report paths and counts only, never the private terms themselves.
    const hits = findDenied(allContent, deny).map(({ path }) => path);
    expect(hits).toEqual([]);
  });

  it('catches a planted client name (self-test)', () => {
    expect(findDenied(plantedContent, [...deny, 'Planted Client Co']).map((h) => h.path)).toContain(
      'caseStudies[0].title',
    );
  });
});
