'use client';

import { Search } from 'lucide-react';
import { useState, useSyncExternalStore, type ReactNode } from 'react';

interface FilterCard {
  slug: string;
  category: string;
  /** Everything a visitor might type to find this project: name, hook, summary, stack. */
  text: string;
  card: ReactNode;
}

interface ProjectFilterProps {
  categories: { value: string; label: string }[];
  cards: FilterCard[];
}

const ALL = 'all';
const EVENT = 'project-filter-change';
const noop = () => () => {};

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * Type-to-search plus a category filter synced to `?category=`; the two combine, and the result list
 * scrolls with the page. The server renders every card (so visitors without
 * JavaScript see them all); the filter bar appears only once hydrated.
 */
export function ProjectFilter({ categories, cards }: ProjectFilterProps) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const requested = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get('category') ?? ALL,
    () => ALL,
  );
  const [query, setQuery] = useState('');
  const active = categories.some((c) => c.value === requested) ? requested : ALL;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = cards.filter(
    (c) =>
      (active === ALL || c.category === active) &&
      terms.every((term) => c.text.toLowerCase().includes(term)),
  );

  function choose(value: string) {
    const url = new URL(window.location.href);
    if (value === ALL) url.searchParams.delete('category');
    else url.searchParams.set('category', value);
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event(EVENT));
  }

  const options = [{ value: ALL, label: 'All' }, ...categories];

  return (
    <div>
      {/* Rendered on the server too, but invisible (and so unfocusable and unannounced) until
          hydrated: it reserves its space, so the grid never jumps (spec 12.5 CLS). */}
      <div className={hydrated ? '' : 'invisible'}>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex max-w-md flex-col gap-1.5">
            <label htmlFor="project-search" className="label-mono text-ink">
              Search projects
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="project-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-describedby="project-search-hint"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                className="block min-h-11 w-full rounded-chip border border-line bg-surface py-2 pr-3 pl-9 text-ink transition-[border-color] duration-150 hover:border-ink-muted focus-visible:border-accent"
              />
            </div>
            <p id="project-search-hint" className="text-sm text-ink-muted">
              By name, tool or result, like Playwright or OWASP.
            </p>
          </div>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {options.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={active === value}
                onClick={() => choose(value)}
                className="min-h-11 rounded-chip border border-line bg-surface px-3 font-mono text-xs font-medium text-ink-muted hover:text-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-bg"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p role="status" aria-live="polite" className="label-mono mb-4 min-h-5 text-ink-muted">
        {hydrated ? `Showing ${shown.length} of ${cards.length} projects` : ''}
      </p>
      {shown.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ slug, card }) => (
            <li key={slug}>{card}</li>
          ))}
        </ul>
      ) : (
        <div className="rounded-card border border-line bg-surface p-6">
          <p className="text-ink">
            {terms.length > 0
              ? `No projects match "${query.trim()}"${active === ALL ? '' : ' in this category'}.`
              : 'No projects in this category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              choose(ALL);
            }}
            className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent"
          >
            Show all projects
          </button>
        </div>
      )}
    </div>
  );
}
