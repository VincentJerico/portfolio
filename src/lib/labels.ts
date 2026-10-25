import type { Finding, ProjectCategory, Severity } from '@/content/schema';

// Visible wording from docs/01-PORTFOLIO-DATA.md Section 3 (decision C4).
const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  accessibility: 'Accessibility',
  security: 'Security',
  performance: 'Performance',
  api: 'API / Contract',
  'ui-automation': 'UI Automation / Framework',
  'full-stack-testing': 'Full-stack testing',
  hub: 'Portfolio hub',
  capstone: 'Capstone',
};

export function categoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category];
}

export const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'serious',
  'high',
  'medium',
  'moderate',
  'low',
  'info',
];

/** Counts of the listed findings per severity, most severe first, zero counts omitted. */
export function severityCounts(findings: readonly Pick<Finding, 'severity'>[]) {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    count: findings.filter((f) => f.severity === severity).length,
  })).filter(({ count }) => count > 0);
}
