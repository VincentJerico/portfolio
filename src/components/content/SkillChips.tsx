import type { SkillGroup } from '@/content/schema';

/** One row per group; learning skills are outlined and labelled, never shown as proven. */
export function SkillChips({ groups }: { groups: readonly SkillGroup[] }) {
  return (
    <dl className="divide-y divide-line rounded-card border border-line bg-surface">
      {groups.map((group) => (
        <div key={group.group} className="grid gap-2 px-4 py-3 md:grid-cols-[12rem_1fr] md:gap-6">
          <dt className="label-mono pt-1 text-ink-muted">
            {group.group}
            {group.learning && <span className="sr-only"> (learning)</span>}
          </dt>
          <dd>
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
                  {group.learning && (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 font-mono text-[0.6875rem] text-accent uppercase"
                    >
                      learning
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
