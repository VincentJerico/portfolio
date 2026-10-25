import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { certifications, education, experience, profile, skills } from '@/content';
import { projectsInOrder, visible } from '@/lib/content';
import { formatCertDate, formatMonth, formatPeriod } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Resume',
  description: profile.oneLiner,
};

function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6 print:pt-3">
      <h2 className="label-mono text-ink-muted print:text-[9pt]">{title}</h2>
      <div className="mt-4 print:mt-2">{children}</div>
    </section>
  );
}

export default function ResumePage() {
  const jobs = visible(experience);
  const projects = projectsInOrder();
  const degree = visible(education)[0];
  const proven = skills.filter((group) => !group.learning);

  return (
    <article className="resume mx-auto flex max-w-3xl flex-col gap-8 print:max-w-none print:gap-4">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1>{profile.fullName}</h1>
          <span data-print-hide>
            <ButtonLink href={profile.cvPdf} variant="primary" download>
              <Download aria-hidden="true" className="size-4" />
              Download PDF
            </ButtonLink>
          </span>
        </div>
        <p className="text-lg font-semibold text-ink">
          {profile.role} at {profile.company}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          <li>{profile.location}</li>
          <li>
            <a href={`mailto:${profile.email}`} className="font-mono">
              {profile.email}
            </a>
          </li>
          <li>
            <a href={profile.github}>GitHub</a>
          </li>
          {profile.linkedin && (
            <li>
              <a href={profile.linkedin}>LinkedIn</a>
            </li>
          )}
        </ul>
      </header>

      <ResumeSection title="Summary">
        <p className="text-ink">{profile.background}</p>
        <p className="mt-2 text-ink">{profile.tagline}</p>
      </ResumeSection>

      <ResumeSection title="Experience">
        <ol className="flex flex-col gap-5 print:gap-3">
          {jobs.map((job) => (
            <li key={job.slug} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3>{job.title}</h3>
                <span className="label-mono text-ink-muted">
                  {formatPeriod(job.start, job.end)}
                </span>
              </div>
              <p className="text-sm text-ink-muted">
                {job.company}
                {job.location && ` · ${job.location}`}
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[0.9375rem] text-ink print:text-[10pt]">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </ResumeSection>

      <ResumeSection title="Selected projects">
        <ul className="flex flex-col gap-2 text-[0.9375rem] print:text-[10pt]">
          {projects.map((project) => (
            <li key={project.slug} className="break-inside-avoid">
              <span className="font-mono font-medium text-ink">{project.name}</span>
              {project.team && <span className="text-ink-muted"> (team project)</span>}
              <span className="text-ink-muted"> — {project.summary}</span>
            </li>
          ))}
        </ul>
      </ResumeSection>

      <ResumeSection title="Skills">
        <dl className="grid gap-x-6 gap-y-1.5 text-[0.9375rem] sm:grid-cols-[11rem_1fr] print:grid-cols-[9rem_1fr] print:text-[9.5pt]">
          {proven.map((group) => (
            <div key={group.group} className="contents">
              <dt className="font-semibold text-ink">{group.group}</dt>
              <dd className="text-ink-muted">{group.skills.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </ResumeSection>

      {degree && (
        <ResumeSection title="Education">
          <div className="break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3>{degree.degree}</h3>
              <span className="label-mono text-ink-muted">{formatMonth(degree.graduated)}</span>
            </div>
            <p className="text-sm text-ink-muted">{degree.school}</p>
            <p className="mt-1 text-[0.9375rem] text-ink">
              {degree.gpa && <>GPA {degree.gpa}</>}
              {degree.honors.length > 0 && <> · {degree.honors.join(' · ')}</>}
            </p>
          </div>
        </ResumeSection>
      )}

      <ResumeSection title="Certifications">
        <ul className="grid gap-x-6 gap-y-1 text-[0.9375rem] sm:grid-cols-2 print:text-[9.5pt]">
          {certifications.map((cert) => (
            <li key={cert.name}>
              <span className="text-ink">{cert.name}</span>
              <span className="text-ink-muted">
                {' '}
                · {cert.issuer}, {formatCertDate(cert.date)}
              </span>
            </li>
          ))}
        </ul>
      </ResumeSection>

      {profile.languages.length > 0 && (
        <ResumeSection title="Languages">
          <p className="text-ink">{profile.languages.join(' · ')}</p>
        </ResumeSection>
      )}
    </article>
  );
}
