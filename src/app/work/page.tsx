import type { Metadata } from 'next';
import { CaseStudyCard } from '@/components/content/CaseStudyCard';
import { Section } from '@/components/content/Section';
import { experience } from '@/content';
import { approvedCaseStudies, visible } from '@/lib/content';
import { formatPeriod } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Client Work',
  description: 'Software QA/QC work at BossLabs.AI and anonymised client case studies.',
};

export default function ClientWorkPage() {
  const role = visible(experience).find((item) => item.hasCaseStudies);
  const studies = approvedCaseStudies();

  return (
    <div className="flex flex-col gap-14">
      <header className="measure">
        <p className="label-mono text-ink-muted">Client work</p>
        <h1 className="mt-4">Client Work</h1>
      </header>

      {role && (
        <Section
          id="role"
          title={`${role.title} at ${role.company}`}
          kicker={formatPeriod(role.start, role.end)}
        >
          <div className="measure flex flex-col gap-3">
            {role.companyDescription && <p className="text-ink">{role.companyDescription}</p>}
            <ul className="flex list-disc flex-col gap-2 pl-5 text-ink-muted marker:text-ink-muted">
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {studies.length > 0 && (
        <Section id="case-studies" title="Case studies">
          <p className="measure mb-6 rounded-card border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">
            Client names, data and screenshots are withheld.
          </p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {studies.map((study) => (
              <li key={study.slug}>
                <CaseStudyCard study={study} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
