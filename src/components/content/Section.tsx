import type { ReactNode } from 'react';
import { Inspectable } from '@/components/bughunt/Inspectable';

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
          {kicker && <p className="label-mono mb-2 text-ink-muted">{kicker}</p>}
          <Inspectable id={`section-${id}`} label={`${title} heading`}>
            <h2 id={headingId}>{title}</h2>
          </Inspectable>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
