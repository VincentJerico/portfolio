import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { notes, visibleNotes } from '@/content/notes';
import type { Note } from '@/content/schema';
import { navItems } from '@/lib/nav-items';
import { sitemapEntries } from '@/lib/seo';
import { paletteItems } from '@/lib/site-index';
import { denylistProblems, findBanned, findDenied } from '@/lib/strings';
import { loadDenylist } from '../helpers/denylist';

const DIR = join(process.cwd(), 'src/content/notes');
const files = readdirSync(DIR).filter((name) => name.endsWith('.mdx'));

const note = (over: Partial<Note>): Note => ({
  slug: 'a-note',
  title: 'A note',
  summary: 'A summary.',
  date: '2026-11-05',
  status: 'published',
  ...over,
});

describe('notes registry', () => {
  it('has an MDX file for every registry slug and an entry for every MDX file', () => {
    expect(files.map((name) => name.replace(/\.mdx$/, '')).sort()).toEqual(
      notes.map((n) => n.slug).sort(),
    );
  });

  it('has unique slugs', () => {
    expect(new Set(notes.map((n) => n.slug)).size).toBe(notes.length);
  });
});

describe('visibleNotes', () => {
  it('hides drafts and the selftest note outside the test build', () => {
    expect(visibleNotes(false).every((n) => n.status === 'published')).toBe(true);
    expect(visibleNotes(false).map((n) => n.slug)).not.toContain('selftest-pipeline');
  });

  it('shows the selftest note in the test build', () => {
    expect(visibleNotes(true).map((n) => n.slug)).toContain('selftest-pipeline');
    expect(visibleNotes(true).every((n) => n.status !== 'draft')).toBe(true);
  });
});

describe('notes in navigation and the sitemap', () => {
  it('omit /notes when no note is visible', () => {
    expect(navItems([]).map((n) => n.href)).not.toContain('/notes');
    const urls = sitemapEntries('https://example.dev', undefined, []).map((e) => e.url);
    expect(urls.some((u) => u.includes('/notes'))).toBe(false);
  });

  it('include /notes and each note page when one is visible', () => {
    const visible = [note({ slug: 'first' })];
    expect(navItems(visible).map((n) => n.href)).toContain('/notes');
    const urls = sitemapEntries('https://example.dev', undefined, visible).map((e) => e.url);
    expect(urls).toContain('https://example.dev/notes');
    expect(urls).toContain('https://example.dev/notes/first');
  });
});

describe('notes in the command palette', () => {
  it('lists each visible note in the test build, keyed by its summary', () => {
    const [selftest] = visibleNotes(true);
    expect(paletteItems(visibleNotes(true))).toContainEqual({
      href: `/notes/${selftest!.slug}`,
      label: selftest!.title,
      group: 'Notes',
      keywords: selftest!.summary,
    });
  });

  it('lists no note and no Notes page when none is visible', () => {
    const hrefs = paletteItems([]).map((item) => item.href);
    expect(hrefs.some((href) => href.startsWith('/notes'))).toBe(false);
  });
});

describe('note text guards', () => {
  const texts = Object.fromEntries(
    files.map((name) => [name, readFileSync(join(DIR, name), 'utf8')]),
  );

  it('contains no placeholder markers or emojis', () => {
    expect(findBanned(texts).map(({ path, rule }) => ({ path, rule }))).toEqual([]);
    expect(findBanned(notes)).toEqual([]);
  });

  it('matches nothing on the client denylist', () => {
    const deny = loadDenylist();
    expect(denylistProblems(deny)).toEqual([]);
    expect(findDenied({ texts, notes }, deny).map(({ path }) => path)).toEqual([]);
  });
});
