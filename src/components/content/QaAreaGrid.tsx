export function QaAreaGrid({ areas }: { areas: readonly string[] }) {
  return (
    // From 768px the coverage map shows the areas; the list stays for screen readers.
    <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 md:sr-only lg:grid-cols-3 print:not-sr-only">
      {areas.map((area, i) => (
        <li key={area} className="scan flex items-baseline gap-3 bg-surface px-4 py-3">
          <span aria-hidden="true" className="font-mono text-xs text-ink-muted">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-[0.9375rem] text-ink">{area}</span>
        </li>
      ))}
    </ul>
  );
}
