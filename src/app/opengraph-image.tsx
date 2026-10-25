import { metrics, profile } from '@/content';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = `${profile.fullName}: ${profile.headline}`;

export default function Image() {
  const wcag = metrics.find((m) => m.id === 'wcag-failures');
  return renderOgImage({
    kicker: `${profile.role} · ${profile.company}`,
    title: profile.fullName,
    line: wcag ? `${wcag.value} ${wcag.label}` : profile.headline,
  });
}
