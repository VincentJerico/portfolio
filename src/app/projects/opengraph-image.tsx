import { profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Projects · ${profile.fullName}`;

export default function Image() {
  return renderOgImage({ kicker: 'Projects', title: 'Projects', line: profile.tagline });
}
