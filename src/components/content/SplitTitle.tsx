/**
 * The hero name, set as letters that rise out of their line one after another on load and jump when
 * the cursor passes over them (globals.css). The heading's accessible text is the whole name, once;
 * the letters are hidden from assistive tech. Real spaces sit between the words, so copying the
 * visible letters still gives the name.
 */
export function SplitTitle({ id, text }: { id: string; text: string }) {
  let index = 0;
  const words = text.split(' ');
  return (
    <h1 id={id} className="split-title">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-split>
        {words.map((word, w) => (
          <span key={`${word}-${w}`}>
            <span className="split-w">
              {[...word].map((char, c) => (
                <span
                  key={c}
                  className="split-ch"
                  style={{ '--i': index++ } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </h1>
  );
}
