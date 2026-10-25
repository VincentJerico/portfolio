import { projectBySlug, projectsInOrder } from '@/lib/content';
import { categoryLabel } from '@/lib/labels';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Test report from Vincent Jerico Alcuran';

export function generateStaticParams() {
  return projectsInOrder().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = projectBySlug((await params).slug)!;
  return renderOgImage({
    kicker: `Test report · ${categoryLabel(project.category)}`,
    title: project.name,
    line: project.hook.replace(/`/g, ''),
  });
}
