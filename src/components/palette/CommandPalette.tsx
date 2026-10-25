'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface PaletteItem {
  href: string;
  label: string;
  group: 'Pages' | 'Projects' | 'Findings' | 'Case studies';
  /** Extra text that should match a query but isn't shown. */
  keywords?: string;
}

function matches(item: PaletteItem, query: string): boolean {
  const haystack = `${item.label} ${item.keywords ?? ''}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** A combobox in a modal dialog: type to filter, arrows to move, Enter to go, Esc to close. */
export function CommandPalette({ items, onClose }: { items: PaletteItem[]; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(
    () => (query.trim() ? items.filter((item) => matches(item, query)) : items).slice(0, 30),
    [items, query],
  );

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [onClose]);

  function go(item: PaletteItem | undefined) {
    if (!item) return;
    dialogRef.current?.close();
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  }

  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search"
      className="mx-auto mt-[12vh] w-[min(94vw,36rem)] max-w-none rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="border-b border-line p-3">
        <input
          autoFocus
          role="combobox"
          aria-label="Search the site"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optionId(active) : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Pages, projects, findings…"
          className="min-h-11 w-full rounded-chip border border-line bg-bg px-3 text-ink placeholder:text-ink-muted"
        />
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[50vh] overflow-y-auto p-2"
      >
        {results.map((item, i) => (
          <li
            key={`${item.group}-${item.href}`}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(item)}
            className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-chip px-3 aria-selected:bg-surface-2"
          >
            <span className="min-w-0 truncate text-ink">{item.label}</span>
            <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">{item.group}</span>
          </li>
        ))}
      </ul>
      <p
        role="status"
        aria-live="polite"
        className="border-t border-line px-4 py-2 font-mono text-xs text-ink-muted"
      >
        {results.length === 0
          ? 'No results'
          : `${results.length} result${results.length === 1 ? '' : 's'}`}
      </p>
    </dialog>
  );
}
