import { Check } from 'lucide-react';

type StepState = 'done' | 'current' | 'next';

// Spec 7.6, with the present role marked as current (docs/01-PORTFOLIO-DATA.md: "Current role |
// Software QA/QC Engineer at BossLabs.AI", started 2026-09-03, present).
const STEPS: { label: string; state: StepState }[] = [
  { label: 'IT Support Intern', state: 'done' },
  { label: 'Software QA/QC Engineer', state: 'current' },
  { label: 'SDET', state: 'next' },
  { label: 'Cybersecurity / Cloud Engineering', state: 'next' },
];

const CARD: Record<StepState, string> = {
  done: 'border-accent/50 bg-surface',
  current: 'border-accent bg-secondary shadow-[0_0_0_1px_var(--accent)]',
  next: 'border-dashed border-line bg-transparent',
};

export function CareerPath() {
  return (
    <ol aria-label="Career path" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {STEPS.map((step, i) => (
        <li
          key={step.label}
          data-state={step.state}
          className={`relative flex items-start gap-3 rounded-card border p-4 ${CARD[step.state]}`}
        >
          <span
            aria-hidden="true"
            className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs ${
              step.state === 'done'
                ? 'bg-accent text-bg'
                : step.state === 'current'
                  ? 'career-current border-2 border-accent bg-bg'
                  : 'border border-line text-ink-muted'
            }`}
          >
            {step.state === 'done' ? (
              <Check className="size-4" />
            ) : step.state === 'current' ? (
              <span className="size-2.5 rounded-full bg-accent" />
            ) : (
              i + 1
            )}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-semibold break-words text-ink">{step.label}</span>
            <span
              className={`label-mono ${step.state === 'current' ? 'text-accent' : 'text-ink-muted'}`}
            >
              {step.state}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
