import { profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Quality · ${profile.fullName}`;

export default function Image() {
  return renderOgImage({
    kicker: 'Quality',
    title: 'Quality',
    line: 'How this site is tested: the quality gates it must pass and the latest CI results.',
  });
}
