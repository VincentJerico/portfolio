import type { WorkItem } from '@/components/content/WorkList';
import type { CaseStudy, Project } from '@/content/schema';
import { categoryLabel } from './labels';

/** The year a project ran: its stated year (C3), else the year of its last or first commit. */
export function projectYear(project: Project): string | undefined {
  return project.year ?? (project.endDate ?? project.startDate)?.slice(0, 4);
}

/** A project as a row of the work list; its name morphs into the report title. */
export function projectItem(project: Project): WorkItem {
  return {
    href: `/projects/${project.slug}`,
    name: project.name,
    num: project.order,
    meta: categoryLabel(project.category),
    year: projectYear(project),
    hook: project.hook,
    morph: `project-title-${project.slug}`,
  };
}

/** An approved case study as a row of the work list; its title morphs into the case study title. */
export function caseStudyItem(study: CaseStudy): WorkItem {
  return {
    href: `/work/${study.slug}`,
    name: study.title,
    meta: study.period,
    hook: study.system,
    morph: `case-title-${study.slug}`,
  };
}
