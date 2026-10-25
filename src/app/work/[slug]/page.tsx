import { notFound } from 'next/navigation';

// Slugs come from the content layer in Phase 2; until then every slug is a 404.
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

export default function CaseStudyPage(): never {
  notFound();
}
