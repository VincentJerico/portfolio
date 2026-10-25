import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/env';
import { sitemapEntries } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(getEnv().NEXT_PUBLIC_SITE_URL);
}
