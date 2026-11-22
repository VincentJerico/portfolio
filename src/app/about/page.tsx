import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { CareerPath } from '@/components/content/CareerPath';
import { Section } from '@/components/content/Section';
import { Timeline } from '@/components/content/Timeline';
import { WorkList } from '@/components/content/WorkList';
import { Disclosure } from '@/components/ui/Disclosure';
import {
  certifications,
  education,
  experience,
  metrics,
  profile,
  qaAreas,
  timeline,
} from '@/content';
import { projectBySlug, visible } from '@/lib/content';
import { formatCertDate, formatDay, formatMonth, formatPeriod } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { projectItem } from '@/lib/work-items';
import { InkText } from '@/components/motion/InkText';
import { LetterTitle } from '@/components/motion/Letters';
import { Odometer } from '@/components/motion/Odometer';
import { RollOnView } from '@/components/motion/RollOnView';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description: profile.oneLiner,
  path: '/about',
});

const ROW = 'border-b border-line py-4';

export default function AboutPage() {
  const degree = visible(education)[0];
  const earlier = visible(experience).filter((item) => !item.hasCaseStudies);
  const capstone = degree?.capstoneSlug ? projectBySlug(degree.capstoneSlug) : undefined;
  const asOf = metrics[0]?.asOf;

  return (
    <div className="flex flex-col gap-rhythm">
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">About</p>
        <LetterTitle text="About" />
      </header>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_14rem] lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="measure flex flex-col gap-4">
          <InkText text={profile.intro} className="text-xl text-ink lg:text-2xl" />
          {profile.background && <p className="text-ink-muted">{profile.background}</p>}
        </div>
        {profile.photo && (
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.fullName}`}
            width={510}
            height={680}
            sizes="(min-width: 1024px) 18rem, (min-width: 768px) 14rem, 100vw"
            className="w-full max-w-72 rounded-card"
          />
        )}
      </div>

      {metrics.length > 0 && (
        <Section
          id="numbers"
          title="In numbers"
          kicker={asOf ? `As of ${formatDay(asOf)}` : undefined}
        >
          <RollOnView className="odo-list stagger grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric) => (
              <li key={metric.id} className="flex flex-col gap-1 border-b border-line py-4 pr-6">
                <p className="metric-value text-4xl font-extrabold tracking-[-0.02em] text-ink [font-variation-settings:'opsz'_96,'wdth'_75]">
                  <Odometer value={metric.value} />
                </p>
                <p className="text-sm text-ink">{metric.label}</p>
                <a
                  href={metric.source.href}
                  className="label-mono inline-flex min-h-6 items-center self-start pointer-coarse:min-h-11"
                >
                  source<span className="sr-only">: {metric.source.label}</span>
                </a>
              </li>
            ))}
          </RollOnView>
        </Section>
      )}

      <Section id="career-path" title="Career path">
        <CareerPath />
      </Section>

      {degree && (
        <Section id="education" title="Education">
          <div className="measure border-t border-line pt-4">
            <h3>{degree.degree}</h3>
            <p className="mt-1 text-ink-muted">{degree.school}</p>
            <p className="label-mono mt-3 text-ink-muted">
              Graduated {formatMonth(degree.graduated)}
              {degree.honors.length > 0 && ` · ${degree.honors.join(' · ')}`}
            </p>
            {degree.coursework.length > 0 && (
              <>
                <p className="label-mono mt-5 text-ink-muted">Relevant coursework</p>
                <p className="mt-1 text-ink">{degree.coursework.join(' · ')}</p>
              </>
            )}
          </div>
        </Section>
      )}

      {earlier.length > 0 && (
        <Section id="experience" title="Earlier experience">
          <ul className="border-t border-line">
            {earlier.map((item) => (
              <li
                key={item.slug}
                className={`${ROW} grid gap-x-8 gap-y-2 md:grid-cols-[14rem_minmax(0,1fr)]`}
              >
                <p className="label-mono text-ink-muted">{formatPeriod(item.start, item.end)}</p>
                <div className="measure">
                  <h3>{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {item.company}
                    {item.location && ` · ${item.location}`}
                  </p>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem] text-ink marker:text-ink-muted">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="certifications" title="Certifications">
        {/* The first three, then the rest on demand (C55 D19). */}
        <ul className="border-t border-line">{certifications.slice(0, 3).map(certificationRow)}</ul>
        {certifications.length > 3 && (
          <Disclosure summary={`Show all ${certifications.length} certifications`}>
            <ul className="border-t border-line">
              {certifications.slice(3).map(certificationRow)}
            </ul>
          </Disclosure>
        )}
      </Section>

      {profile.languages.length > 0 && (
        <Section id="languages" title="Languages">
          <p className="text-xl text-ink">{profile.languages.join(' · ')}</p>
        </Section>
      )}

      {capstone && (
        <Section
          id="capstone"
          title="Capstone"
          kicker={`${capstone.team ? 'Team project' : 'Project'}${capstone.year ? ` · ${capstone.year}` : ''}`}
        >
          <WorkList items={[{ ...projectItem(capstone), hook: capstone.summary }]} />
        </Section>
      )}

      <Section id="method" title="How I test" kicker="Checklist for every client build">
        <ol className="deck border-t border-line">
          {qaAreas.map((area, i) => (
            <li
              key={area}
              style={{ '--i': i } as CSSProperties}
              className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-line bg-(--layer-1) py-4 shadow-(--layer-highlight)"
            >
              <span aria-hidden="true" className="font-mono text-xl text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-2xl font-semibold text-ink">{area}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="timeline" title="Timeline" kicker="Oldest first">
        <Timeline events={visible(timeline)} />
      </Section>
    </div>
  );
}

function certificationRow(cert: (typeof certifications)[number]) {
  return (
    <li
      key={cert.name}
      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3"
    >
      <span className="text-ink">
        {cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}
        <span className="text-ink-muted"> · {cert.issuer}</span>
      </span>
      <span className="label-mono text-ink-muted">{formatCertDate(cert.date)}</span>
    </li>
  );
}
