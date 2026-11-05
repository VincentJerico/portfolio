import { notFound } from 'next/navigation';
import { profile } from '@/content';
import { visibleNotes } from '@/content/notes';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Notes · ${profile.fullName}`;

export default function Image() {
  // Like the page, the image does not exist until the first note is published (decision C29).
  if (visibleNotes().length === 0) notFound();
  return renderOgImage({ kicker: 'Notes', title: 'Notes', line: profile.tagline });
}
