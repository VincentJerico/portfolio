// Server-side only: the command palette's index and the P2 reading order for this build.
import type { PaletteItem } from '@/components/palette/CommandPalette';
import { approvedCaseStudies, projectsInOrder } from './content';
import { navItems } from './nav-items';
import { readingOrder, type Step } from './next-spec';

export function paletteItems(): PaletteItem[] {
  const projects = projectsInOrder();
  return [
    ...navItems().map((item) => ({ href: item.href, label: item.label, group: 'Pages' as const })),
    ...projects.map((p) => ({
      href: `/projects/${p.slug}`,
      label: p.name,
      group: 'Projects' as const,
      keywords: `${p.summary} ${p.stack.join(' ')}`,
    })),
    ...projects.flatMap((p) =>
      p.findings.map((f) => ({
        href: `/projects/${p.slug}#ticket-${f.id}`,
        label: `${f.id} · ${f.title.replace(/`/g, '')}`,
        group: 'Findings' as const,
        keywords: `${p.name} ${f.severity} ${f.reference ?? ''}`,
      })),
    ),
    ...approvedCaseStudies().map((c) => ({
      href: `/work/${c.slug}`,
      label: c.title,
      group: 'Case studies' as const,
      keywords: c.industry,
    })),
  ];
}

export function siteReadingOrder(): { order: Step[]; reportsWithNext: string[] } {
  const projects = projectsInOrder().map((p) => ({ href: `/projects/${p.slug}`, label: p.name }));
  const studies = approvedCaseStudies();
  return {
    order: readingOrder({
      projects,
      caseStudies: studies.map((c) => ({ href: `/work/${c.slug}`, label: c.title })),
      hasClientWork: studies.length > 0,
    }),
    // Every report but the last already ends with a link to the next report.
    reportsWithNext: projects.slice(0, -1).map((p) => p.href),
  };
}
