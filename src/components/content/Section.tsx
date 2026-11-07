import type { ReactNode } from 'react';
import { Inspectable } from '@/components/bughunt/Inspectable';
import { DecodeLabel } from '@/components/ui/DecodeLabel';

interface SectionProps {
  id: string;
  title: string;
  /** Mono control-panel label above the heading. */
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A labelled region: its h2 names the landmark, so screen-reader users can jump between sections. */
export function Section({ id, title, kicker, action, children, className = '' }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-20 ${className}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          {kicker && (
            <p className="label-mono mb-2 text-ink-muted">
              <DecodeLabel text={kicker} />
            </p>
          )}
          <Inspectable id={`section-${id}`} label={`${title} heading`}>
            <h2 id={headingId} className="flex items-center gap-3">
              {/* Decorative: the section "passes" as it scrolls into view (globals.css). */}
              <span
                aria-hidden="true"
                className="reveal-dot size-2.5 shrink-0 rounded-full print:hidden"
              />
              {title}
            </h2>
          </Inspectable>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
