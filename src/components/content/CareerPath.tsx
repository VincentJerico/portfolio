type StepState = 'done' | 'current' | 'next';

// Spec 7.6, with the present role marked as current (docs/01-PORTFOLIO-DATA.md: "Current role |
// Software QA/QC Engineer at BossLabs.AI", started 2026-09-03, present).
const STEPS: { label: string; state: StepState }[] = [
  { label: 'IT Support Intern', state: 'done' },
  { label: 'Software QA/QC Engineer', state: 'current' },
  { label: 'SDET', state: 'next' },
  { label: 'Cybersecurity / Cloud Engineering', state: 'next' },
];

/** The career path as a ruled list (C51): done, the current step in the accent, then what is next. */
export function CareerPath() {
  return (
    <ol aria-label="Career path" className="border-t border-line">
      {STEPS.map((step, i) => (
        <li
          key={step.label}
          data-state={step.state}
          className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-line py-3"
        >
          <span aria-hidden="true" className="label-mono text-ink-muted">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className={`text-xl font-semibold break-words ${step.state === 'current' ? 'text-accent' : step.state === 'next' ? 'text-ink-muted' : 'text-ink'}`}
          >
            {step.label}
          </span>
          <span className="label-mono text-ink-muted">{step.state}</span>
        </li>
      ))}
    </ol>
  );
}
