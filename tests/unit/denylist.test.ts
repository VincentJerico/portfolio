import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allContent } from '@/content';
import { denylistProblems, findDenied, parseDenylist } from '@/lib/strings';
import { plantedContent } from '../fixtures/planted-content';

// Private terms that must never be published: client names, postal code, street address.
// Locally: tests/fixtures/client-denylist.txt (git-ignored). CI: the CLIENT_DENYLIST secret.
const FILE = 'tests/fixtures/client-denylist.txt';

function loadDenylist(): string[] {
  const text = existsSync(FILE) ? readFileSync(FILE, 'utf8') : process.env.CLIENT_DENYLIST;
  if (!text?.trim()) {
    throw new Error(`client denylist missing: create ${FILE} or set CLIENT_DENYLIST`);
  }
  return parseDenylist(text);
}

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
