import { Fragment, type CSSProperties } from 'react';
import { splitLetters } from '@/lib/motion-text';

/**
 * A title's letters, each rising in after the one before (C52, move 2). The letters are inline blocks
 * while they move, and browsers read inline blocks as separate words ("A b o u t"), so they are hidden
 * from assistive tech: the heading that holds them carries the text as its name (see LetterTitle).
 * textContent is still exactly the text, for crawlers and copy.
 */
export function Letters({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <span aria-hidden="true">
      {splitLetters(text, start).map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="word">
            {word.letters.map((letter) => (
              <span
                key={letter.index}
                className="letter"
                style={{ '--i': letter.index } as CSSProperties}
              >
                {letter.char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** A page's h1 whose letters rise in; named by its text. */
export function LetterTitle({ text, className }: { text: string; className?: string }) {
  return (
    <h1 aria-label={text} className={className}>
      <Letters text={text} />
    </h1>
  );
}
