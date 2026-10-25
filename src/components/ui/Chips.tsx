/** Wrapped chip list; beyond `max` the rest sit behind a native "+n" disclosure (no JS needed). */
export function Chips({
  items,
  max = Infinity,
  label,
}: {
  items: readonly string[];
  max?: number;
  label: string;
}) {
  const shown = items.slice(0, max);
  const hidden = items.slice(max);
  const chip =
    'rounded-chip border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink-muted';

  return (
    <ul aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {shown.map((item) => (
        <li key={item} className={chip}>
          {item}
        </li>
      ))}
      {hidden.length > 0 && (
        <li className="contents">
          <details className="group contents">
            <summary
              className={`${chip} inline-flex min-h-6 cursor-pointer list-none items-center text-accent group-open:hidden [&::-webkit-details-marker]:hidden`}
            >
              +{hidden.length}
              <span className="sr-only"> more</span>
            </summary>
            {hidden.map((item) => (
              <span key={item} className={chip}>
                {item}
              </span>
            ))}
          </details>
        </li>
      )}
    </ul>
  );
}
