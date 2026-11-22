import type { ReactNode } from 'react';

/**
 * Detail that opens on demand (C55 D19): a native disclosure, so it works without JavaScript, find in
 * page opens it, and print shows it open (globals.css). Nothing inside is removed, only folded.
 */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="disclosure">
      <summary className="inline-flex min-h-11 items-center font-mono text-[0.8125rem] text-accent">
        {summary}
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}
