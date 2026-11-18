import type { CSSProperties } from 'react';
import { reel } from '@/lib/motion-text';

/**
 * A recorded value whose digits roll into place like an odometer (C52, move 4).
 *
 * The real digits stay plain inline text, so textContent and every reader get exactly the data string
 * ("108", never "1 0 8"). Where the motion runs, each real digit is clipped out of sight (still read)
 * and a decorative window over it, hidden from assistive tech, rolls a reel of numbers up to the same
 * digit; the reel is generated content, so it never reaches textContent. Words in the value stay still.
 */
export function Odometer({ value }: { value: string }) {
  return Array.from(value, (char, i) => {
    if (!/[0-9]/.test(char)) return char;
    const { lines, steps } = reel(Number(char));
    return (
      <span key={i} className="odo-digit">
        <span className="odo-real">{char}</span>
        <span className="odo-window" aria-hidden="true">
          <span
            className="odo-reel"
            data-reel={`${lines}\n${char}`}
            style={{ '--steps': steps } as CSSProperties}
          />
        </span>
      </span>
    );
  });
}
