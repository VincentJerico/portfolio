import type { z } from 'zod';
import type { Certification } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 8. Credential URLs are TODO, so none are set.
export const certifications: z.input<typeof Certification>[] = [
  { name: 'Introduction to the Threat Landscape 3.0', issuer: 'Fortinet', date: '2026-07' },
  { name: 'Introduction to SQL', issuer: 'DataCamp', date: '2025-04' },
  { name: 'Understanding Data Engineering', issuer: 'DataCamp', date: '2025-01/2025-04' },
  { name: 'Understanding Cloud Computing', issuer: 'DataCamp', date: '2025-01/2025-04' },
  { name: 'Understanding Data Topics', issuer: 'DataCamp', date: '2025-01/2025-04' },
  { name: 'Understanding Data Visualization', issuer: 'DataCamp', date: '2025-01/2025-04' },
  { name: 'Understanding Machine Learning', issuer: 'DataCamp', date: '2025-01/2025-04' },
  { name: 'Understanding Data Science', issuer: 'DataCamp', date: '2025-01/2025-04' },
];
