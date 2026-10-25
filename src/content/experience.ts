import type { z } from 'zod';
import type { Experience } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 4. Order: BossLabs, internship, scholarship (spec 7.7).
export const experience: z.input<typeof Experience>[] = [
  {
    slug: 'bosslabs',
    company: 'BossLabs.AI',
    companyDescription: 'Builds custom business platforms for Filipino companies, shipped in weeks',
    title: 'Software QA/QC Engineer',
    start: '2026-09-03',
    kind: 'job',
    bullets: [
      'Test client business platforms before they ship: functional and black-box QA, data-layer checks, UAT with clients, end-to-end testing, defect reporting and re-testing, UI/UX review',
    ],
    hasCaseStudies: true,
    status: 'verified',
  },
  {
    slug: 'rhu-it-support',
    company: 'Rural Health Unit & Barangay Health Centers',
    location: 'Tanza, Cavite',
    title: 'IT Support Intern – Technical Support & Health Data Management',
    start: '2026-02',
    end: '2026-05',
    kind: 'internship',
    bullets: [
      'Troubleshot and validated hardware, software, printers and Windows workstations; performed software installation, updates, malware scanning and preventive maintenance',
      'Analysed reported technical issues, reproduced problems when possible, and applied corrective actions',
      'Managed and validated electronic health records using Microsoft Office and SQL-based systems, checking data accuracy, completeness and consistency',
      'Supported users with technical issues while maintaining confidentiality and data accuracy',
    ],
    status: 'verified',
  },
  {
    slug: 'gdg-datacamp',
    company: 'Google Developer Groups (GDG), Polytechnic University of the Philippines – Manila',
    title: 'DataCamp Scholar',
    start: '2025-01',
    end: '2025-11',
    kind: 'scholarship',
    bullets: [
      'Completed training in SQL, Data Engineering, Cloud Computing, Data Visualization, Machine Learning and Data Science',
      'Developed practical SQL and data analysis skills through hands-on querying, validation and data management',
    ],
    status: 'verified',
  },
];
