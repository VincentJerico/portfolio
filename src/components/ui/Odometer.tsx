/**
 * A value whose digits roll up like a counter as it scrolls into view (CSS scroll timeline; no
 * script). Inside a `.odo-scope` (the run summary grid) every column shares that one timeline. The
 * strip of digits is drawn by CSS, so each digit is a single empty element. Words stay together and
 * wrap like normal text. Screen readers get the plain value once; the columns are hidden from them.
 */
export function Odometer({ value }: { value: string }) {
  let digit = 0;
  const words = value.split(' ');
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" data-odometer data-value={value}>
        {words.map((word, w) => (
          <span key={w}>
            <span className="odo-word">
              {[...word].map((char, i) => {
                if (!/\d/.test(char)) return <span key={i}>{char}</span>;
                const order = digit++;
                return (
                  <span
                    key={i}
                    className="odo-col"
                    style={{ '--d': char, '--i': order } as React.CSSProperties}
                  >
                    <span className="odo-strip" />
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>
  );
}
