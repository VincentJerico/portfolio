'use client';

import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { flushSync } from 'react-dom';
import { morph } from '@/lib/morph';

export interface PaletteItem {
  href: string;
  label: string;
  group: 'Pages' | 'Projects' | 'Findings' | 'Case studies' | 'Notes';
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
export function CommandPalette({
  items,
  onClose,
  growFrom,
}: {
  items: PaletteItem[];
  onClose: () => void;
  growFrom: HTMLElement | null;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputId = useId();

  const results = useMemo(
    () => (query.trim() ? items.filter((item) => matches(item, query)) : items).slice(0, 30),
    [items, query],
  );

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    // Closing shrinks the palette back into the Search button it grew from (or lets it fade when it
    // was opened from the keyboard). Esc and a click on the backdrop are caught so they do the same.
    const shrink = () => {
      const target = growFrom?.isConnected && growFrom.checkVisibility() ? growFrom : null;
      morph(dialog, () => {
        // Close first: while the dialog is modal, nothing outside it can take focus back.
        dialog.close();
        flushSync(onClose);
        return target;
      });
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      shrink();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) shrink();
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
    };
  }, [onClose, growFrom]);

  // The highlight is one marker that glides to the active option instead of jumping between rows.
  useLayoutEffect(() => {
    const marker = markerRef.current;
    const option = scrollRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!marker) return;
    marker.hidden = !option;
    if (option) {
      marker.style.translate = `0 ${option.offsetTop}px`;
      marker.style.height = `${option.offsetHeight}px`;
    }
  }, [active, results]);

  function go(item: PaletteItem | undefined) {
    if (!item) return;
    dialogRef.current?.close();
    const url = new URL(item.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) {
      // Same page: set the hash directly so hashchange fires (TicketOpener opens the ticket).
      window.location.hash = url.hash;
    } else {
      router.push(item.href);
    }
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
        {/* A visible label, never a placeholder alone (spec 12.3 guard F-6). */}
        <label htmlFor={inputId} className="label-mono mb-2 block text-ink-muted">
          Search the site
        </label>
        <input
          id={inputId}
          autoFocus
          role="combobox"
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
      <div ref={scrollRef} className="relative max-h-[50vh] overflow-y-auto p-2">
        <div
          ref={markerRef}
          aria-hidden="true"
          className="palette-marker pointer-events-none absolute inset-x-2 top-0 rounded-chip bg-surface-2"
        />
        <ul id={listId} role="listbox" aria-label="Results">
          {results.map((item, i) => (
            <li
              key={`${item.group}-${item.href}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
              style={{ '--i': Math.min(i, 8) } as CSSProperties}
              className="palette-option relative flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-chip px-3"
            >
              <span className="min-w-0 truncate text-ink">{item.label}</span>
              <span className="shrink-0 font-mono text-[0.6875rem] text-ink-muted">
                {item.group}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="border-t border-line px-4 py-2 font-mono text-xs text-ink-muted"
      >
        {results.length === 0 ? (
          'No results'
        ) : (
          <>
            <span key={results.length} className="count-roll inline-block">
              {results.length}
            </span>{' '}
            result{results.length === 1 ? '' : 's'}
          </>
        )}
      </p>
    </dialog>
  );
}
