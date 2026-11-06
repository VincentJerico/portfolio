import { notFound } from 'next/navigation';
import { visibleNotes } from '@/content/notes';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
// Unknown slugs are a 404, not a render error.
export const dynamicParams = false;
export const alt = 'Note from Vincent Jerico Alcuran';

export function generateStaticParams() {
  return visibleNotes().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = visibleNotes().find((n) => n.slug === slug);
  if (!note) notFound();
  return renderOgImage({ kicker: 'Note', title: note.title, line: note.summary });
}
