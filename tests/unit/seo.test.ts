import { describe, expect, it } from 'vitest';
import type { CaseStudy } from '@/content/schema';
import { pageMetadata, sitemapEntries } from '@/lib/seo';

const BASE = 'https://example.dev';

describe('sitemapEntries', () => {
  it('lists every public route as an absolute URL', () => {
    const urls = sitemapEntries(BASE).map((e) => e.url);
    expect(urls).toContain('https://example.dev');
    expect(urls).toContain('https://example.dev/projects/accessibility-testing');
    expect(urls).toContain('https://example.dev/work/warehouse-operations-platform');
    expect(urls.every((u) => u.startsWith(BASE))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('drops a case study as soon as it is not approved', () => {
    const studies = [{ slug: 'hidden', approved: false, status: 'verified' } as CaseStudy];
    const urls = sitemapEntries(BASE, studies).map((e) => e.url);
    expect(urls).not.toContain('https://example.dev/work/hidden');
    expect(urls).not.toContain('https://example.dev/work');
  });
});

describe('pageMetadata', () => {
  it('sets the canonical, description and social cards', () => {
    const meta = pageMetadata({ title: 'Skills', description: 'd', path: '/skills' });
    expect(meta.alternates?.canonical).toBe('/skills');
    expect(meta.description).toBe('d');
    expect(meta.openGraph).toMatchObject({ url: '/skills', title: 'Skills', description: 'd' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});
