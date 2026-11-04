import { profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `Client Work · ${profile.fullName}`;

export default function Image() {
  return renderOgImage({
    kicker: 'Client Work',
    title: 'Client Work',
    line: 'Software QA/QC work at BossLabs.AI and anonymised client case studies.',
  });
}
