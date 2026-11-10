const DIGITS = '0123456789';

/**
 * A value whose digits roll up like a counter as it scrolls into view (CSS scroll timeline; no
 * script). Each digit is a column of 0 to 9 resting on its real digit, so the value reads correctly
 * with no animation at all. Screen readers get the plain value once; the columns are hidden from them.
 */
export function Odometer({ value }: { value: string }) {
  let digit = 0;
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" data-odometer data-value={value} className="odo">
        {[...value].map((char, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={i} className="odo-char">
                {char}
              </span>
            );
          }
          const order = digit++;
          return (
            <span
              key={i}
              className="odo-col"
              style={{ '--d': char, '--i': order } as React.CSSProperties}
            >
              {[...DIGITS].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          );
        })}
      </span>
    </>
  );
}
