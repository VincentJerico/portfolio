'use client';

import { RotateCw } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PortraitCardProps {
  photo: string;
  name: string;
  /** Rows for the back face, already resolved from verified profile data. */
  facts: { label: string; value: string }[];
}

/**
 * The hero portrait as a test fixture that flips to show its data. The button is the accessible
 * control; clicking the card is a pointer shortcut. The hidden face is inert, so focus and screen
 * readers only ever meet the face on show. Reduced motion turns the flip into an instant swap.
 */
export function PortraitCard({ photo, name, facts }: PortraitCardProps) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((value) => !value);

  return (
    <div className="flex w-full max-w-[240px] flex-col items-start gap-2 md:items-end">
      <div className="group w-full [perspective:1000px]" onClick={toggle}>
        <div
          data-flipped={flipped || undefined}
          className="relative w-full cursor-pointer transition-transform duration-500 ease-[var(--ease-snap)] [transform-style:preserve-3d] group-hover:[transform:rotateY(-6deg)] data-flipped:[transform:rotateY(180deg)] data-flipped:group-hover:[transform:rotateY(174deg)]"
        >
          <figure
            inert={flipped}
            className="rounded-card border border-line bg-surface p-2 shadow-card [backface-visibility:hidden]"
          >
            <Image
              src={photo}
              alt={name}
              width={510}
              height={680}
              sizes="240px"
              loading="eager"
              fetchPriority="high"
              className="aspect-[3/4] w-full rounded-[4px] object-cover object-[50%_35%]"
            />
            <figcaption className="mt-2 px-1 font-mono text-[0.6875rem] text-ink-muted">
              fixture · vincent-portrait.jpg · 510×680
            </figcaption>
          </figure>
          <div
            inert={!flipped}
            data-testid="portrait-back"
            className="absolute inset-0 flex flex-col overflow-hidden rounded-card border border-line bg-secondary p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] print:hidden"
          >
            <p className="label-mono text-ink-muted">fixture · vincent.json</p>
            <dl className="mt-3 flex flex-col gap-2.5 font-mono text-[0.8125rem]">
              {facts.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-ink-muted">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flipped}
        onClick={toggle}
        className="press inline-flex min-h-11 items-center gap-2 rounded-chip px-2 font-mono text-xs text-accent hover:bg-surface-2"
      >
        <RotateCw
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-500 ${flipped ? 'rotate-180' : ''}`}
        />
        Flip card
      </button>
    </div>
  );
}
