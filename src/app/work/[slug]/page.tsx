import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/content/Section';
import { StatusChip } from '@/components/ui/StatusChip';
import { approvedCaseStudies, caseStudySlugs } from '@/lib/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs().map((slug) => ({ slug }));
}

function findStudy(slug: string) {
  return approvedCaseStudies().find((study) => study.slug === slug);
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const study = findStudy((await params).slug);
  return study ? { title: study.title, description: study.system } : {};
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="measure flex list-disc flex-col gap-2 pl-5 text-ink marker:text-ink-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const study = findStudy((await params).slug);
  if (!study) notFound();

  const facts: [string, string][] = [
    ['Industry', study.industry],
    ['System', study.system],
  ];
  if (study.period) facts.push(['Period', study.period]);

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <li>
              <Link href="/work" className="inline-flex min-h-11 items-center">
                Client Work
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page" className="text-ink">
                {study.title}
              </span>
            </li>
          </ol>
        </nav>
        <p className="label-mono text-ink-muted">Case study · anonymised</p>
        <h1>{study.title}</h1>
        {study.currentlyTesting && (
          <p>
            <StatusChip status="running" label="Currently testing" />
          </p>
        )}
      </header>

      <dl className="grid gap-x-8 gap-y-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-[8rem_1fr]">
        {facts.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="label-mono pt-0.5 text-ink-muted">{term}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <Section id="what-i-did" title="What I did">
        <List items={study.activities} />
      </Section>
      {study.outcomes.length > 0 && (
        <Section id="outcomes" title="Outcomes">
          <List items={study.outcomes} />
        </Section>
      )}
      {study.method.length > 0 && (
        <Section id="method" title="Method">
          <List items={study.method} />
        </Section>
      )}

      <p className="text-sm text-ink-muted">Client names, data and screenshots are withheld.</p>
    </article>
  );
}
