import type { z } from 'zod';
import type { Education } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 7. GPA shows only on /resume, with the scale note.
export const education: z.input<typeof Education>[] = [
  {
    degree: 'Bachelor of Science in Information Technology',
    school: 'Cavite State University — Trece Martires City Campus',
    graduated: '2026-08',
    gpa: '1.80 (Philippine scale, 1.00 highest)',
    honors: ["Dean's Lister"],
    coursework: [
      'Software Engineering',
      'Database Management',
      'Web Systems & Technologies',
      'Information Assurance & Security',
      'Systems Administration',
      'Computer Networks',
    ],
    capstoneSlug: 'legatalink',
    status: 'verified',
  },
];
