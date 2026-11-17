'use client';

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

interface FilterCard {
  slug: string;
  category: string;
  /** Everything a visitor might type to find this project: name, hook, summary, stack. */
  text: string;
  /** The row's contents (WorkRowBody), rendered on the server. */
  card: ReactNode;
}

interface ProjectFilterProps {
  categories: { value: string; label: string }[];
  cards: FilterCard[];
}

const ALL = 'all';
// The site's shared motion (C50): the --ease-snap curve, 400 ms to arrive or move, 180 ms to leave.
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const ARRIVE = 400;
const LEAVE = 180;

interface Snapshot {
  /** Position relative to the list, so scrolling between filters never skews a move. */
  x: number;
  y: number;
  width: number;
  height: number;
  node: HTMLElement;
}

/**
 * Animates the result list when it changes, without a view transition (one swallowed clicks and
 * focus on this page, so the input and chips must stay live): cards that stay glide from their old
 * place, new cards rise in with the site's shared rise, and removed cards leave a copy behind that
 * lifts away. Transforms on
 * cards and opacity on the aria-hidden copies only. Off under reduced motion.
 */
function useResultMotion(
  list: React.RefObject<HTMLUListElement | null>,
  ghosts: React.RefObject<HTMLDivElement | null>,
  shownKey: string,
) {
  const last = useRef(new Map<string, Snapshot>());
  useLayoutEffect(() => {
    const ul = list.current;
    const layer = ghosts.current;
    const before = last.current;
    const next = new Map<string, Snapshot>();
    if (!ul || !layer) {
      last.current = next;
      return;
    }
    const origin = ul.getBoundingClientRect();
    const items = [...ul.querySelectorAll<HTMLElement>(':scope > li[data-slug]')];
    for (const li of items) {
      const box = li.getBoundingClientRect();
      next.set(li.dataset.slug!, {
        x: box.left - origin.left,
        y: box.top - origin.top,
        width: box.width,
        height: box.height,
        node: li,
      });
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (before.size > 0 && !reduced) {
      let entered = 0;
      for (const [slug, now] of next) {
        const then = before.get(slug);
        if (then) {
          const dx = then.x - now.x;
          const dy = then.y - now.y;
          if (dx || dy) {
            now.node.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], {
              duration: ARRIVE,
              easing: EASE,
            });
          }
        } else {
          now.node.animate([{ translate: '0 16px' }, { translate: '0 0' }], {
            duration: ARRIVE,
            easing: EASE,
            delay: Math.min(entered++, 6) * 40,
            fill: 'backwards',
          });
        }
      }
      for (const [slug, then] of before) {
        if (next.has(slug)) continue;
        const ghost = then.node.cloneNode(true) as HTMLElement;
        ghost.removeAttribute('data-slug');
        // Outside its list a copied item would show a bullet; a block has none.
        Object.assign(ghost.style, {
          display: 'block',
          position: 'absolute',
          left: `${then.x}px`,
          top: `${then.y}px`,
          width: `${then.width}px`,
          height: `${then.height}px`,
          margin: '0',
        });
        layer.append(ghost);
        ghost
          .animate(
            [
              { translate: '0 0', opacity: 1 },
              { translate: '0 -8px', opacity: 0 },
            ],
            { duration: LEAVE, easing: EASE, fill: 'forwards' },
          )
          .finished.catch(() => {})
          .finally(() => ghost.remove());
      }
    }
    // A removed card's element keeps its contents after React detaches it, so it can be copied then.
    last.current = next;
  }, [list, ghosts, shownKey]);
}
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
  const listRef = useRef<HTMLUListElement>(null);
  const ghostsRef = useRef<HTMLDivElement>(null);
  const active = categories.some((c) => c.value === requested) ? requested : ALL;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = cards.filter(
    (c) =>
      (active === ALL || c.category === active) &&
      terms.every((term) => c.text.toLowerCase().includes(term)),
  );

  useResultMotion(listRef, ghostsRef, shown.map((c) => c.slug).join(' '));

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
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex max-w-md flex-col gap-1.5">
            <label htmlFor="project-search" className="label-mono text-ink">
              Search projects
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-describedby="project-search-hint"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              className="block min-h-11 w-full border-0 border-b border-ink-muted bg-transparent px-0 py-2 text-lg text-ink hover:border-ink focus-visible:border-accent"
            />
            <p id="project-search-hint" className="text-sm text-ink-muted">
              By name, tool or result, like Playwright or OWASP.
            </p>
          </div>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-x-5">
            {options.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={active === value}
                onClick={() => choose(value)}
                className="min-h-11 min-w-11 font-mono text-[0.8125rem] text-ink-muted underline-offset-4 hover:text-ink aria-pressed:text-accent aria-pressed:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p role="status" aria-live="polite" className="label-mono mb-4 min-h-5 text-ink-muted">
        {hydrated && (
          <>
            Showing {/* The count rolls up to its new value whenever the results change. */}
            <span key={shown.length} className="count-roll inline-block">
              {shown.length}
            </span>{' '}
            of {cards.length} projects
          </>
        )}
      </p>
      <div className="relative">
        {/* Copies of removed cards shrink away here; React never renders into it. */}
        <div
          ref={ghostsRef}
          aria-hidden="true"
          inert
          className="pointer-events-none absolute inset-0 z-10"
        />
        {/* Always mounted, even when empty, so the last cards can still leave. */}
        <ul ref={listRef} className="work-list">
          {shown.map(({ slug, card }) => (
            <li key={slug} data-slug={slug} className="work-row">
              {card}
            </li>
          ))}
        </ul>
      </div>
      {shown.length === 0 && (
        <div className="reveal-in border-y border-line py-6">
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
            className="mt-2 inline-flex min-h-11 items-center font-mono text-[0.8125rem] text-accent"
          >
            Show all projects
          </button>
        </div>
      )}
    </div>
  );
}
