import { describe, expect, it } from 'vitest';
import { findBanned, findDenied, parseDenylist } from '@/lib/strings';
import { plantedContent } from '../fixtures/planted-content';

describe('findBanned (self-test: planted defects must be reported)', () => {
  const issues = findBanned(plantedContent);
  const at = (path: string) => issues.filter((issue) => issue.path === path).map((i) => i.rule);

  it('reports TODO, lorem, CONFIRM and APPROVAL', () => {
    expect(at('profile.headline')).toContain('TODO');
    expect(at('notes[0]')).toContain('lorem');
    expect(at('notes[1]')).toContain('CONFIRM');
    expect(at('notes[2]')).toContain('APPROVAL');
  });

  it.each(['emoji.plain', 'emoji.heartWithSelector', 'emoji.keycap', 'emoji.flag'])(
    'reports the emoji at %s',
    (path) => {
      expect(at(path)).toContain('emoji');
    },
  );

  it('accepts typographic characters used by the data file', () => {
    expect(
      findBanned({ ok: 'Software QA/QC Engineer · SDET — 12 s p95 – 2026 (1.00 highest)' }),
    ).toEqual([]);
  });
});

describe('parseDenylist', () => {
  it('trims, drops blank lines and comments, and handles CRLF', () => {
    expect(parseDenylist('  Acme \r\n\n# comment\nBeta Co\n')).toEqual(['Acme', 'Beta Co']);
  });
});

describe('findDenied', () => {
  it('matches case-insensitively and reports the path', () => {
    expect(findDenied({ a: ['x', 'made by ACME'] }, ['acme'])).toEqual([
      { path: 'a[1]', term: 'acme' },
    ]);
  });

  it('finds a planted client name (self-test)', () => {
    expect(findDenied(plantedContent, ['Planted Client Co'])).toEqual([
      { path: 'caseStudies[0].title', term: 'Planted Client Co' },
    ]);
  });
});
