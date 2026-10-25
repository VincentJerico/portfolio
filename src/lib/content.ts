import { caseStudies, projects } from '@/content';
import type { CaseStudy, Project, Status } from '@/content/schema';

export function visible<T extends { status: Status }>(items: readonly T[]): T[] {
  return items.filter((item) => item.status === 'verified');
}

export function approvedCaseStudies(items: readonly CaseStudy[] = caseStudies): CaseStudy[] {
  return visible(items).filter((item) => item.approved);
}

export function caseStudySlugs(): string[] {
  return approvedCaseStudies().map((item) => item.slug);
}

export function projectsInOrder(): Project[] {
  return visible(projects).sort((a, b) => a.order - b.order);
}

export function projectBySlug(slug: string): Project | undefined {
  return projectsInOrder().find((project) => project.slug === slug);
}
