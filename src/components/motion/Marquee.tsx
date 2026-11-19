/**
 * The skills strip (C52, move 6): two rows of skills that slide in opposite directions as the page
 * scrolls, never on their own (WCAG 2.2.2). Each row repeats once, hidden from assistive tech, so its
 * edges stay filled while it moves. Without scroll-driven animations or under reduced motion the
 * copies go and the rows wrap, so every skill is on screen.
 */
export function Marquee({ rows }: { rows: [string[], string[]] }) {
  return (
    <section aria-labelledby="skills-strip-heading" className="marquee">
      <h2 id="skills-strip-heading" className="sr-only">
        Skills
      </h2>
      {rows.map((row, r) => (
        <div key={r} className="marquee-row" data-dir={r === 0 ? 'left' : 'right'}>
          <ul>
            {row.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
          <ul aria-hidden="true">
            {row.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
