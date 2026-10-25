import { Check } from 'lucide-react';

// Spec 7.6: the first two steps are done, the rest are next.
const STEPS = [
  { label: 'IT Support Intern', done: true },
  { label: 'Software QA/QC Engineer', done: true },
  { label: 'SDET', done: false },
  { label: 'Cybersecurity / Cloud Engineering', done: false },
];

export function CareerPath() {
  return (
    <ol aria-label="Career path" className="grid gap-3 md:grid-cols-4">
      {STEPS.map((step, i) => (
        <li
          key={step.label}
          className={`relative flex items-start gap-3 rounded-card border p-4 ${
            step.done ? 'border-accent/50 bg-surface' : 'border-dashed border-line bg-transparent'
          }`}
        >
          <span
            aria-hidden="true"
            className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs ${
              step.done ? 'bg-accent text-bg' : 'border border-line text-ink-muted'
            }`}
          >
            {step.done ? <Check className="size-4" /> : i + 1}
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-semibold text-ink">{step.label}</span>
            <span className="label-mono text-ink-muted">{step.done ? 'done' : 'next'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
