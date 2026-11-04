import { profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Resume · ${profile.fullName}`;

export default function Image() {
  return renderOgImage({ kicker: 'Resume', title: 'Resume', line: profile.oneLiner });
}
