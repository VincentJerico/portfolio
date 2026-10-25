import { ArrowRight, Download, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CaseStudyCard } from '@/components/content/CaseStudyCard';
import { ProjectCard } from '@/components/content/ProjectCard';
import { QaAreaGrid } from '@/components/content/QaAreaGrid';
import { Section } from '@/components/content/Section';
import { SkillChips } from '@/components/content/SkillChips';
import { Timeline } from '@/components/content/Timeline';
import { ButtonLink } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { MetricTile } from '@/components/ui/MetricTile';
import { experience, metrics, profile, qaAreas, skills, timeline } from '@/content';
import { approvedCaseStudies, projectsInOrder, visible } from '@/lib/content';
import { formatDay, formatPeriod } from '@/lib/format';

export default function OverviewPage() {
  const featured = projectsInOrder().filter((project) => project.featured);
  const caseStudies = approvedCaseStudies().slice(0, 3);
  const role = visible(experience).find((item) => item.hasCaseStudies);
  const latestEvents = visible(timeline)
    .filter((event) => event.kind !== 'next')
    .slice(-6)
    .reverse();
  const asOf = metrics[0]?.asOf;

  return (
    <div className="flex flex-col gap-20 lg:gap-24">
      {/* 1. Hero */}
      <section
        aria-labelledby="hero-heading"
        className="grid items-start gap-10 md:grid-cols-[1fr_auto]"
      >
        <div className="measure">
          <p className="label-mono text-ink-muted">
            {profile.role} · {profile.company}
          </p>
          <h1 id="hero-heading" className="mt-4">
            {profile.fullName}
          </h1>
          <p className="mt-5 text-xl font-semibold text-ink lg:text-2xl">{profile.headline}</p>
          <p className="mt-4 text-ink-muted">{profile.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/projects" variant="primary">
              View projects
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
            <ButtonLink href={profile.cvPdf} download>
              <Download aria-hidden="true" className="size-4" />
              Download CV
            </ButtonLink>
            <ButtonLink href={`mailto:${profile.email}`} variant="ghost">
              <Mail aria-hidden="true" className="size-4" />
              Email me
            </ButtonLink>
          </div>
        </div>
        {profile.photo && (
          <figure className="w-full max-w-[240px] justify-self-start rounded-card border border-line bg-surface p-2 shadow-card md:justify-self-end">
            <Image
              src={profile.photo}
              alt={profile.fullName}
              width={510}
              height={680}
              sizes="240px"
              loading="eager"
              fetchPriority="high"
              className="aspect-[3/4] w-full rounded-[4px] object-cover object-[50%_35%]"
            />
            <figcaption className="mt-2 px-1 font-mono text-[0.6875rem] text-ink-muted">
              fixture · vincent-portrait.jpg · 510×680
            </figcaption>
          </figure>
        )}
      </section>

      {/* 2. Run summary */}
      <Section
        id="run-summary"
        title="Run summary"
        kicker={`${metrics.length} checks${asOf ? ` · as of ${formatDay(asOf)}` : ''}`}
      >
        <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((metric) => (
            <li key={metric.id}>
              <MetricTile metric={metric} />
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Featured projects */}
      <Section
        id="featured-projects"
        title="Featured projects"
        kicker="Test suites"
        action={
          <Link href="/projects" className="inline-flex min-h-11 items-center font-semibold">
            All projects
          </Link>
        }
      >
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. Client work teaser */}
      {caseStudies.length > 0 && role && (
        <Section id="client-work" title="Client work" kicker={`${role.title} · ${role.company}`}>
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,20rem)_1fr]">
            <div className="rounded-card border border-line bg-surface-2 p-5">
              <p className="label-mono text-ink-muted">{formatPeriod(role.start, role.end)}</p>
              {role.companyDescription && (
                <p className="mt-3 text-[0.9375rem] text-ink">{role.companyDescription}</p>
              )}
              <Link href="/work" className="mt-4 inline-flex min-h-11 items-center font-semibold">
                The role and all case studies
              </Link>
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              {caseStudies.map((study) => (
                <li key={study.slug}>
                  <CaseStudyCard study={study} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* 5. How I test */}
      <Section
        id="how-i-test"
        title="How I test"
        kicker="Checklist for every client build"
        action={
          <Link href="/about#method" className="inline-flex min-h-11 items-center font-semibold">
            More on the method
          </Link>
        }
      >
        <QaAreaGrid areas={qaAreas} />
      </Section>

      {/* 6. Skills snapshot */}
      <Section
        id="skills"
        title="Skills"
        action={
          <Link href="/skills" className="inline-flex min-h-11 items-center font-semibold">
            Skills with evidence
          </Link>
        }
      >
        <SkillChips groups={skills} />
      </Section>

      {/* 7. Timeline */}
      <Section
        id="timeline"
        title="Timeline"
        kicker="Latest"
        action={
          <Link href="/about#timeline" className="inline-flex min-h-11 items-center font-semibold">
            Full timeline
          </Link>
        }
      >
        <Timeline events={latestEvents} />
      </Section>

      {/* 8. Contact */}
      <Section id="contact" title="Contact">
        <div className="rounded-card border border-line bg-surface p-6 lg:p-8">
          <p className="measure text-lg text-ink">{profile.tagline}</p>
          <p className="mt-2 font-mono text-sm text-ink-muted">{profile.email}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href={`mailto:${profile.email}`} variant="primary">
              <Mail aria-hidden="true" className="size-4" />
              Send an email
            </ButtonLink>
            <CopyButton value={profile.email} label="Copy email" />
          </div>
        </div>
      </Section>
    </div>
  );
}
