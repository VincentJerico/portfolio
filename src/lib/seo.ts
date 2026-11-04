import type { Metadata, MetadataRoute } from 'next';
import { caseStudies as allCaseStudies, profile } from '@/content';
import type { CaseStudy } from '@/content/schema';
import { approvedCaseStudies, projectsInOrder } from './content';
import { NAV_ITEMS } from './nav';

/** Per-page metadata: canonical (resolved against metadataBase), description and social cards. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    // Next merges metadata shallowly: this replaces the layout's openGraph, so repeat the site fields.
    openGraph: {
      type: 'website',
      siteName: profile.fullName,
      locale: 'en',
      url: path,
      ...(title ? { title } : {}),
      description,
    },
    twitter: { card: 'summary_large_image', ...(title ? { title } : {}), description },
  };
}

/** Every public route; unapproved case studies (and Client Work without any) are left out. */
export function sitemapEntries(
  base: string,
  studies: readonly CaseStudy[] = allCaseStudies,
): MetadataRoute.Sitemap {
  const approved = approvedCaseStudies(studies);
  const paths = [
    ...NAV_ITEMS.map((item) => item.href).filter((href) => href !== '/work' || approved.length > 0),
    ...projectsInOrder().map((p) => `/projects/${p.slug}`),
    ...approved.map((c) => `/work/${c.slug}`),
  ];
  return paths.map((path) => ({ url: path === '/' ? base : `${base}${path}` }));
}
