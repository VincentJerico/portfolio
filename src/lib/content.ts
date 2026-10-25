import type { CaseStudy, Status } from '@/content/schema';

export function visible<T extends { status: Status }>(items: readonly T[]): T[] {
  return items.filter((item) => item.status === 'verified');
}

export function approvedCaseStudies(items: readonly CaseStudy[]): CaseStudy[] {
  return visible(items).filter((item) => item.approved);
}
