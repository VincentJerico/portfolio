// Server-side only: explorer rows for this build, from nav, content and the CI report.
import type { ExplorerRow } from '@/components/explorer/TestExplorerNav';
import { projectsInOrder } from './content';
import { navItems } from './nav-items';
import { qualityReport } from './quality-report';
import { routeDuration, routeStatus, runSummaryLine, siteStatus } from './quality';

export function explorerData() {
  const rows: ExplorerRow[] = navItems().map((item) => ({
    ...item,
    status: routeStatus(qualityReport, item.href),
    duration: routeDuration(qualityReport, item.href),
  }));
  const projects: ExplorerRow[] = projectsInOrder().map((project) => {
    const href = `/projects/${project.slug}`;
    return {
      href,
      label: project.name,
      spec: `${project.slug}.spec`,
      status: routeStatus(qualityReport, href),
      duration: routeDuration(qualityReport, href),
    };
  });
  return {
    rows,
    projects,
    summary: runSummaryLine(qualityReport),
    site: siteStatus(qualityReport),
  };
}
