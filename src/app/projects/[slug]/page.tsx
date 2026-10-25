import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DataTable } from '@/components/content/DataTable';
import { DecisionList } from '@/components/content/DecisionList';
import { DefectTicket } from '@/components/content/DefectTicket';
import { EvidenceGallery } from '@/components/content/EvidenceGallery';
import { FindingsTable } from '@/components/content/FindingsTable';
import { ResultCallout } from '@/components/content/ResultCallout';
import { RunSummaryPanel } from '@/components/content/RunSummaryPanel';
import { Section } from '@/components/content/Section';
import { InlineCode } from '@/components/ui/InlineCode';
import { projectBySlug, projectsInOrder } from '@/lib/content';
import { categoryLabel } from '@/lib/labels';

export const dynamicParams = false;

export function generateStaticParams() {
  return projectsInOrder().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  return project ? { title: project.name, description: project.summary } : {};
}

function Paragraphs({ items }: { items: readonly string[] }) {
  if (items.length === 1) {
    return (
      <p className="measure text-ink first-letter:uppercase">
        <InlineCode text={items[0]!} />
      </p>
    );
  }
  return (
    <ul className="measure flex list-disc flex-col gap-2 pl-5 text-ink marker:text-ink-muted">
      {items.map((item) => (
        <li key={item} className="first-letter:uppercase">
          <InlineCode text={item} />
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectReportPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  // The run summary already shows the target; don't repeat it under Context.
  const context = project.context.filter((line) => line !== `Target: ${project.target}`);
  const ordered = projectsInOrder();
  const index = ordered.findIndex((p) => p.slug === slug);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];

  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <li>
              <Link href="/projects" className="inline-flex min-h-11 items-center">
                Projects
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page" className="font-mono text-ink">
                {project.name}
              </span>
            </li>
          </ol>
        </nav>
        <p className="label-mono text-ink-muted">Test report · {categoryLabel(project.category)}</p>
        <h1 className="break-words">{project.name}</h1>
        <p className="measure text-lg text-ink-muted">{project.summary}</p>
      </header>

      <RunSummaryPanel project={project} />

      <ResultCallout text={project.hook} />

      {project.team && project.role.length > 0 && (
        <Section id="my-part" title="My part">
          <Paragraphs items={project.role} />
        </Section>
      )}

      {context.length > 0 && (
        <Section id="context" title="Context">
          <Paragraphs items={context} />
        </Section>
      )}

      {project.approach.length > 0 && (
        <Section id="approach" title="Approach">
          <Paragraphs items={project.approach} />
        </Section>
      )}

      {project.findings.length > 0 && (
        <Section
          id="findings"
          title="Findings"
          kicker={`${project.findings.length} defect tickets`}
        >
          <div className="flex flex-col gap-6">
            <FindingsTable findings={project.findings} />
            <div className="flex flex-col gap-2">
              {project.findings.map((finding) => (
                <DefectTicket
                  key={finding.id}
                  finding={finding}
                  evidenceLabel={
                    finding.evidenceIndex !== undefined
                      ? (project.evidence[finding.evidenceIndex]?.caption ?? 'See evidence')
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </Section>
      )}

      {project.decisions.length > 0 && (
        <Section id="decisions" title="Engineering decisions">
          <DecisionList decisions={project.decisions} />
        </Section>
      )}

      {project.extraTables.length > 0 && (
        <Section id="data" title="Results and data">
          <div className="flex flex-col gap-6">
            {project.extraTables.map((table) => (
              <DataTable
                key={table.title}
                caption={table.title}
                columns={table.columns}
                rows={table.rows}
              />
            ))}
          </div>
        </Section>
      )}

      {project.evidence.length > 0 && (
        <Section id="evidence" title="Evidence">
          <EvidenceGallery images={project.evidence} />
        </Section>
      )}

      {project.limits.length > 0 && (
        <Section id="limits" title="Limits and next steps">
          <Paragraphs items={project.limits} />
        </Section>
      )}

      <nav
        aria-label="More projects"
        className="grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={`/projects/${prev.slug}`}
            className="flex min-h-11 flex-col gap-1 rounded-card border border-line bg-surface p-4 no-underline hover:border-accent/60"
          >
            <span className="label-mono flex items-center gap-1.5 text-ink-muted">
              <ArrowLeft aria-hidden="true" className="size-3.5" /> Previous
            </span>
            <span className="font-mono text-ink">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/projects/${next.slug}`}
            className="flex min-h-11 flex-col items-end gap-1 rounded-card border border-line bg-surface p-4 text-right no-underline hover:border-accent/60"
          >
            <span className="label-mono flex items-center gap-1.5 text-ink-muted">
              Next <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
            <span className="font-mono text-ink">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
