import type { Metadata } from 'next';
import { Section } from '@/components/content/Section';
import { WorkList } from '@/components/content/WorkList';
import { experience } from '@/content';
import { approvedCaseStudies, visible } from '@/lib/content';
import { formatPeriod } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { caseStudyItem } from '@/lib/work-items';

export const metadata: Metadata = pageMetadata({
  title: 'Client work',
  description: 'Software QA/QC work at BossLabs.AI and anonymised client case studies.',
  path: '/work',
});

export default function ClientWorkPage() {
  const role = visible(experience).find((item) => item.hasCaseStudies);
  const studies = approvedCaseStudies();

  return (
    <div className="flex flex-col gap-rhythm">
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">Work</p>
        <h1>Client work</h1>
      </header>

      {role && (
        <Section
          id="role"
          title={`${role.title} at ${role.company}`}
          kicker={formatPeriod(role.start, role.end)}
        >
          <div className="measure flex flex-col gap-3">
            {role.companyDescription && (
              <p className="text-lg text-ink">{role.companyDescription}</p>
            )}
            <ul className="flex list-disc flex-col gap-2 pl-5 text-ink-muted marker:text-ink-muted">
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {studies.length > 0 && (
        <Section
          id="case-studies"
          title="Case studies"
          kicker="Client names, data and screenshots are withheld."
        >
          <WorkList items={studies.map(caseStudyItem)} />
        </Section>
      )}
    </div>
  );
}
