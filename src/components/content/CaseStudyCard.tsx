import Link from 'next/link';
import type { CaseStudy } from '@/content/schema';
import { StatusChip } from '@/components/ui/StatusChip';

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card">
      <p className="label-mono text-ink-muted">{study.industry}</p>
      <h3 className="mt-3">{study.title}</h3>
      {study.period && <p className="mt-1 text-sm text-ink-muted">{study.period}</p>}
      {study.currentlyTesting && (
        <p className="mt-3">
          <StatusChip status="running" label="Currently testing" />
        </p>
      )}
      <Link
        href={`/work/${study.slug}`}
        className="mt-auto inline-flex min-h-11 items-center pt-4 font-semibold"
      >
        Read the case study<span className="sr-only">: {study.title}</span>
      </Link>
    </article>
  );
}
