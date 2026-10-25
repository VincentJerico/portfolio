import type { z } from 'zod';
import type { Profile } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 1 (Identity, Positioning). LinkedIn (TODO) and
// open-to-work (not shown) are intentionally omitted.
export const profile: z.input<typeof Profile> = {
  fullName: 'Vincent Jerico Alcuran',
  displayName: 'Vincent Jerico',
  role: 'Software QA/QC Engineer',
  company: 'BossLabs.AI',
  headline: 'Software QA/QC Engineer on the path to SDET.',
  oneLiner:
    'Software QA/QC Engineer at BossLabs.AI · Playwright, API, accessibility, security and performance testing · on the path to SDET',
  intro:
    "I'm a Software QA/QC Engineer at BossLabs.AI, where I test client business platforms before they ship. On GitHub I build a public QA automation portfolio: one repo per testing skill, each with its own CI, real targets and written findings. I'm working toward an SDET role, with Cybersecurity and Cloud Engineering next.",
  background:
    'BS Information Technology graduate (Cavite State University, 2026) with hands-on experience in software troubleshooting, data validation, SQL/database work and web application development.',
  tagline: 'Every suite runs in CI. Every finding has evidence and a test that tracks it.',
  goal: 'SDET',
  nextDirections: ['Cybersecurity', 'Cloud Engineering'],
  location: 'Cavite, Philippines',
  email: 'vincentjericoalcuran@gmail.com',
  github: 'https://github.com/VincentJerico',
  photo: '/images/profile/vincent-portrait.jpg',
  cvPdf: '/cv/Vincent-Jerico-Alcuran-CV.pdf',
  languages: ['English', 'Tagalog'],
};
