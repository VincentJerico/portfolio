import type { Metadata } from 'next';
import Link from 'next/link';
import type { SkillGroup } from '@/content/schema';
import { skills } from '@/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Skills',
  description: 'Testing skills, each linked to the repo or work that proves it.',
  path: '/skills',
});

const LINK = 'hit-area text-sm';

/** One skill group as a ruled row (C51): the group, its tools, then the work that proves them. */
function GroupRow({ group }: { group: SkillGroup }) {
  return (
    <li className="skill-group grid gap-x-8 gap-y-3 border-b border-line py-5 md:grid-cols-[14rem_minmax(0,1fr)]">
      <h3>{group.group}</h3>
      <div className="flex flex-col gap-3">
        <ul
          className={`flex flex-wrap gap-x-4 gap-y-1 ${group.learning ? 'text-ink-muted' : 'text-ink'}`}
        >
          {group.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="label-mono text-ink-muted">Evidence</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {group.evidence.map((item) => (
              <li key={item.label}>
                {item.href.startsWith('/') ? (
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={LINK}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function SkillsPage() {
  const proven = skills.filter((group) => !group.learning);
  const learning = skills.filter((group) => group.learning);

  return (
    <div className="flex flex-col gap-rhythm">
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">Skills</p>
        <h1>Skills</h1>
        <p className="measure text-lg text-ink-muted">
          Only tools actually used in the repos, client work or listed on the CV.
        </p>
      </header>
      <section aria-labelledby="proven-heading">
        <h2 id="proven-heading" className="mb-6">
          Skills with evidence
        </h2>
        <ul className="border-t border-line">
          {proven.map((group) => (
            <GroupRow key={group.group} group={group} />
          ))}
        </ul>
      </section>
      {learning.length > 0 && (
        <section aria-labelledby="learning-heading">
          <h2 id="learning-heading" className="mb-6">
            Learning
          </h2>
          <ul className="border-t border-line">
            {learning.map((group) => (
              <GroupRow key={group.group} group={group} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
