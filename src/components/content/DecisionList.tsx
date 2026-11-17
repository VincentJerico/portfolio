import type { Project } from '@/content/schema';
import { InlineCode } from '@/components/ui/InlineCode';

export function DecisionList({ decisions }: { decisions: Project['decisions'] }) {
  return (
    <ul className="border-t border-line">
      {decisions.map((decision) => (
        <li key={decision.title} className="measure border-b border-line py-4">
          <p className="font-semibold text-ink">
            <InlineCode text={decision.title} />
          </p>
          {decision.body && (
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              <InlineCode text={decision.body} />
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
