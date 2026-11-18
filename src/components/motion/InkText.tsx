import type { CSSProperties } from 'react';

/**
 * A paragraph whose words ink in one after another, muted to ink, just after the page title's letters
 * (C52, move 3). About's intro sits on screen at load, where a scroll-linked ink would either show
 * nothing or leave words muted, so this one runs on time. Muted and ink are both AA colours, so every
 * frame reads; under reduced motion it is simply ink.
 */
export function InkText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className={`ink-text ${className}`}>
      {words.map((word, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties}>
          {i > 0 && ' '}
          {word}
        </span>
      ))}
    </p>
  );
}
