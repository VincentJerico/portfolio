import { profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Skills · ${profile.fullName}`;

export default function Image() {
  return renderOgImage({
    kicker: 'Skills',
    title: 'Skills',
    line: 'Testing skills, each linked to the repo or work that proves it.',
  });
}
