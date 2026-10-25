import type { Metadata } from 'next';
import Link from 'next/link';
import { CareerPath } from '@/components/content/CareerPath';
import { QaAreaGrid } from '@/components/content/QaAreaGrid';
import { Section } from '@/components/content/Section';
import { Timeline } from '@/components/content/Timeline';
import { certifications, education, experience, profile, qaAreas, timeline } from '@/content';
import { projectBySlug, visible } from '@/lib/content';
import { formatCertDate, formatMonth, formatPeriod } from '@/lib/format';

export const metadata: Metadata = {
  title: 'About',
  description: profile.oneLiner,
};

export default function AboutPage() {
  const degree = visible(education)[0];
  const earlier = visible(experience).filter((item) => !item.hasCaseStudies);
  const capstone = degree?.capstoneSlug ? projectBySlug(degree.capstoneSlug) : undefined;

  return (
    <div className="flex flex-col gap-16">
      <header className="measure flex flex-col gap-4">
        <p className="label-mono text-ink-muted">About</p>
        <h1>About</h1>
        <p className="text-lg text-ink">{profile.intro}</p>
        {profile.background && <p className="text-ink-muted">{profile.background}</p>}
        <p className="text-ink-muted">{profile.tagline}</p>
      </header>

      <Section id="career-path" title="Career path">
        <CareerPath />
      </Section>

      {degree && (
        <Section id="education" title="Education">
          <div className="rounded-card border border-line bg-surface p-5">
            <h3>{degree.degree}</h3>
            <p className="mt-1 text-ink-muted">{degree.school}</p>
            <p className="label-mono mt-3 text-ink-muted">
              Graduated {formatMonth(degree.graduated)}
              {degree.honors.length > 0 && ` · ${degree.honors.join(' · ')}`}
            </p>
            {degree.coursework.length > 0 && (
              <>
                <p className="label-mono mt-5 text-ink-muted">Relevant coursework</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {degree.coursework.map((course) => (
                    <li
                      key={course}
                      className="rounded-chip bg-surface-2 px-2 py-0.5 text-sm text-ink"
                    >
                      {course}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Section>
      )}

      {earlier.length > 0 && (
        <Section id="experience" title="Earlier experience">
          <ul className="grid gap-4 lg:grid-cols-2">
            {earlier.map((item) => (
              <li key={item.slug} className="rounded-card border border-line bg-surface p-5">
                <p className="label-mono text-ink-muted">{formatPeriod(item.start, item.end)}</p>
                <h3 className="mt-2">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {item.company}
                  {item.location && ` · ${item.location}`}
                </p>
                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem] text-ink marker:text-ink-muted">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="certifications" title="Certifications">
        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
          {certifications.map((cert) => (
            <li
              key={cert.name}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
            >
              <span className="text-ink">
                {cert.credentialUrl ? <a href={cert.credentialUrl}>{cert.name}</a> : cert.name}
                <span className="text-ink-muted"> · {cert.issuer}</span>
              </span>
              <span className="label-mono text-ink-muted">{formatCertDate(cert.date)}</span>
            </li>
          ))}
        </ul>
      </Section>

      {profile.languages.length > 0 && (
        <Section id="languages" title="Languages">
          <p className="text-ink">{profile.languages.join(' · ')}</p>
        </Section>
      )}

      {capstone && (
        <Section id="capstone" title="Capstone">
          <Link
            href={`/projects/${capstone.slug}`}
            className="block rounded-card border border-line bg-surface p-5 no-underline hover:border-accent/60"
          >
            <p className="label-mono text-ink-muted">
              Capstone{capstone.team && ' (team project)'}
              {capstone.year && ` · ${capstone.year}`}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{capstone.name}</p>
            <p className="mt-1 text-ink-muted">{capstone.summary}</p>
            <p className="mt-3 font-semibold text-accent">Read the LegataLink report</p>
          </Link>
        </Section>
      )}

      <Section id="method" title="How I test" kicker="Checklist for every client build">
        <QaAreaGrid areas={qaAreas} />
      </Section>

      <Section id="timeline" title="Timeline">
        <Timeline events={visible(timeline)} />
      </Section>
    </div>
  );
}
