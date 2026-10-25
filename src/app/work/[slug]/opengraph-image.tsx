import { approvedCaseStudies, caseStudySlugs } from '@/lib/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Anonymised client case study from Vincent Jerico Alcuran';

export function generateStaticParams() {
  return caseStudySlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = approvedCaseStudies().find((c) => c.slug === slug)!;
  return renderOgImage({
    kicker: 'Case study · anonymised',
    title: study.title,
    line: study.industry,
  });
}
