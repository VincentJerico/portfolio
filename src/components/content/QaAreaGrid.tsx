/**
 * The checklist every client build goes through, as a scannable grid. Each area's check mark draws
 * in as the section scrolls into view (globals.css); the mark is decorative, the area name carries
 * the meaning.
 */
export function QaAreaGrid({ areas }: { areas: readonly string[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area, i) => (
        <li
          key={area}
          className="qa-item group flex min-h-14 items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
          style={{ '--i': i } as React.CSSProperties}
        >
          <svg
            data-qa-check
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="size-4 shrink-0 text-pass"
          >
            <path
              className="qa-check"
              d="M3 8.5l3.2 3L13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </svg>
          <span className="text-[0.9375rem] text-ink">{area}</span>
          <span aria-hidden="true" className="ml-auto font-mono text-xs text-ink-muted">
            {String(i + 1).padStart(2, '0')}
          </span>
        </li>
      ))}
    </ol>
  );
}
