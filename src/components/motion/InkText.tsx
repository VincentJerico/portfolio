import type { CSSProperties } from 'react';
import { inkRanges } from '@/lib/motion-text';

/**
 * A paragraph whose words ink in, muted to ink, as it crosses the screen (C52, move 3). One view
 * timeline for the paragraph; each word takes its own slice of it. Muted and ink are both AA colours,
 * so every frame reads. Fully ink without scroll-driven animations or under reduced motion.
 */
export function InkText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const ranges = inkRanges(words.length);
  return (
    <p className={`ink-text ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ '--from': `${ranges[i]!.from}%`, '--to': `${ranges[i]!.to}%` } as CSSProperties}
        >
          {i > 0 && ' '}
          {word}
        </span>
      ))}
    </p>
  );
}
