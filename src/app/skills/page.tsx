import type { Metadata } from 'next';
import Link from 'next/link';
import type { SkillGroup } from '@/content/schema';
import { skills } from '@/content';
import { Inspectable } from '@/components/bughunt/Inspectable';
import { githubSlug } from '@/lib/slug';

// HUNT-01 (Bug Hunt only): a typo in a heading.
const PLANTED_HEADINGS: Record<string, string> = { Accessibility: 'Accessibilty' };

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Testing skills, each linked to the repo or work that proves it.',
};

function GroupCard({ group }: { group: SkillGroup }) {
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <Inspectable
        id={`skills-${githubSlug(group.group)}-heading`}
        label={`${group.group} heading`}
        planted={PLANTED_HEADINGS[group.group] && <h3>{PLANTED_HEADINGS[group.group]}</h3>}
      >
        <h3>{group.group}</h3>
      </Inspectable>
      <ul className="flex flex-wrap gap-1.5">
        {group.skills.map((skill) => (
          <li
            key={skill}
            className={`rounded-chip px-2 py-0.5 text-sm ${
              group.learning
                ? 'border border-dashed border-accent/60 text-ink-muted'
                : 'bg-surface-2 text-ink'
            }`}
          >
            {skill}
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-line pt-3">
        <p className="label-mono text-ink-muted">Evidence</p>
        <ul className="mt-1 flex flex-wrap gap-x-4">
          {group.evidence.map((item) => (
            <li key={item.label}>
              {item.href.startsWith('/') ? (
                <Link href={item.href} className="inline-flex min-h-11 items-center text-sm">
                  {item.label}
                </Link>
              ) : (
                <a href={item.href} className="inline-flex min-h-11 items-center text-sm">
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function SkillsPage() {
  const proven = skills.filter((group) => !group.learning);
  const learning = skills.filter((group) => group.learning);

  return (
    <div className="flex flex-col gap-14">
      <header className="measure">
        <p className="label-mono text-ink-muted">Skills matrix</p>
        <h1 className="mt-4">Skills</h1>
        <p className="mt-5 text-ink-muted">
          Only tools actually used in the repos, client work or listed on the CV.
        </p>
      </header>
      <section aria-labelledby="proven-heading">
        <h2 id="proven-heading" className="mb-6">
          Skills with evidence
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proven.map((group) => (
            <GroupCard key={group.group} group={group} />
          ))}
        </ul>
      </section>
      {learning.length > 0 && (
        <section aria-labelledby="learning-heading">
          <h2 id="learning-heading" className="mb-6">
            Learning
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {learning.map((group) => (
              <GroupCard key={group.group} group={group} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
