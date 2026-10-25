import type { z } from 'zod';
import type { CaseStudy } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 5. Approved anonymously 2026-10-24; no names, regions,
// URLs or platform size figures (decision D5).
export const caseStudies: z.input<typeof CaseStudy>[] = [
  {
    slug: 'warehouse-operations-platform',
    title: 'Warehouse and operations platform (WMS/ERP)',
    industry: 'Office-furniture distribution',
    system:
      'Phone- and tablet-first, barcode-driven operations platform covering sales, payments, warehouse, dispatch, delivery, purchasing, inventory control, accounting and HR',
    period: 'September 2026 – present',
    activities: [
      "Ran user acceptance testing and delivered a UAT results report (17 Sep 2026) that drove the team's fix round on 21 Sep 2026",
      "Leads scenario-by-scenario UAT re-test sessions with the client's team (October 2026)",
    ],
    approved: true,
    status: 'verified',
  },
  {
    slug: 'project-accounting-platform',
    title: 'Project accounting and procurement platform',
    industry:
      'Multi-company group (printing, trading, construction) working on government and private projects',
    system:
      'Project-based accounting, procurement (purchase request to quotation to purchase order) and finance web app',
    period: 'September 2026',
    activities: [
      'Black-box functional QA of the deployed build (4 Sep 2026): 8 bugs reported, ranked by fix priority',
      "Highest-severity bug: project data failed to load right after login because of a server/token clock issue; a page reload hid it, which is why it's easy to miss",
      'Built a 48-check data-layer QA tracker covering reference data, code formats, data migration, field rules, commercial calculations, rollups, access rules and the audit trail, ordered highest risk first',
    ],
    approved: true,
    status: 'verified',
  },
  {
    slug: 'retail-operations-platform',
    title: 'Fine-jewelry retail operations platform',
    industry: 'Fine-jewelry retail',
    system:
      'Pricing engine, catalogue/configurator, orders and production, branch inventory and point of sale',
    period: 'October 2026 – present',
    activities: ['QA of the staging build'],
    approved: true,
    status: 'verified',
    currentlyTesting: true,
  },
];
