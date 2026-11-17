import type { Metadata } from 'next';
import Link from 'next/link';
import { WorkList } from '@/components/content/WorkList';
import { LocalTime } from '@/components/layout/LocalTime';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { education, experience, profile } from '@/content';
import { MANILA_UTC_OFFSET_MINUTES } from '@/lib/clock';
import { approvedCaseStudies, projectsInOrder, visible } from '@/lib/content';
import { getEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';
import { caseStudyItem, projectItem } from '@/lib/work-items';

export const metadata: Metadata = pageMetadata({ description: profile.oneLiner, path: '/' });

const MORE_LINK =
  'label-mono inline-flex min-h-11 items-center text-ink no-underline hover:text-accent';

/**
 * Home (C51): your name as the poster. "VINCENT / JERICO" fills the page, the headline sits in the
 * gap, and small mono details sit underneath; then the projects and the client work as lists of big
 * names, and the email set large.
 */
export default function HomePage() {
  const projects = projectsInOrder();
  const caseStudies = approvedCaseStudies();
  const role = visible(experience).find((item) => item.hasCaseStudies);
  const school = visible(education)[0]?.school;
  const [first, second] = profile.displayName.split(' ');
  const surname = profile.fullName.slice(profile.displayName.length).trim();
  // "Playwright, API, accessibility, security and performance testing" (the one-liner's middle).
  const practice = profile.oneLiner.split(' · ')[1];

  return (
    <div className="flex flex-col gap-section">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.fullName,
          jobTitle: profile.role,
          worksFor: { '@type': 'Organization', name: profile.company },
          url: getEnv().NEXT_PUBLIC_SITE_URL,
          email: `mailto:${profile.email}`,
          sameAs: [profile.github, ...(profile.linkedin ? [profile.linkedin] : [])],
          homeLocation: { '@type': 'Place', name: profile.location },
          knowsLanguage: profile.languages,
          ...(school ? { alumniOf: { '@type': 'CollegeOrUniversity', name: school } } : {}),
        }}
      />

      <header data-poster className="poster-hero">
        <h1 className="poster">
          <span>{first}</span> <span>{second}</span>
          {surname && <span className="sr-only"> {surname}</span>}
        </h1>
        <p className="poster-line">{profile.headline}</p>
        <div className="poster-details label-mono">
          <p>
            {profile.role}
            <br />
            at {profile.company}
          </p>
          {practice && <p className="text-ink-muted">{practice}</p>}
          <div className="md:text-right">
            <p>{profile.location}</p>
            <LocalTime utcOffsetMinutes={MANILA_UTC_OFFSET_MINUTES} />
          </div>
        </div>
      </header>

      <section aria-labelledby="projects-heading">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6">
          <h2 id="projects-heading">Projects</h2>
          <Link href="/projects" className={MORE_LINK}>
            Browse by testing area
          </Link>
        </div>
        <WorkList items={projects.map(projectItem)} />
      </section>

      {caseStudies.length > 0 && role && (
        <section aria-labelledby="client-work-heading">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6">
            <h2 id="client-work-heading">Client work</h2>
            <Link href="/work" className={MORE_LINK}>
              {role.title} at {role.company}
            </Link>
          </div>
          <WorkList items={caseStudies.map(caseStudyItem)} />
        </section>
      )}

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <p className="mt-6">
          <a href={`mailto:${profile.email}`} className="contact-email">
            {profile.email}
          </a>
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CopyButton value={profile.email} label="Copy email" />
          <ButtonLink href={profile.cvPdf} download>
            Download CV
          </ButtonLink>
          <ButtonLink href={profile.github} variant="ghost">
            GitHub
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
