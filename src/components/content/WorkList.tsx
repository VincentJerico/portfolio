import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ViewTransition } from 'react';

export interface WorkItem {
  href: string;
  name: string;
  /** The row's number; defaults to its place in the list. Projects use their display order. */
  num?: number;
  /** A short mono label after the name: the category, or the period. */
  meta?: string;
  year?: string;
  /** One line on what it found or did, shown under the name on hover, focus or touch. */
  hook: string;
  /** The view-transition name the row's name shares with the page title it opens. */
  morph?: string;
}

type HeadingLevel = 'h2' | 'h3';

/**
 * The inside of one row: number, name (the link), meta and hook. Its overlay makes the whole row
 * clickable; hover or focus nudges it, takes the accent and opens the hook (globals.css, .work-row).
 * With `morph`, the name flies into the title of the page it opens.
 */
export function WorkRowBody({
  item,
  index,
  headingLevel = 'h3',
}: {
  item: WorkItem;
  index: number;
  headingLevel?: HeadingLevel;
}) {
  const Heading = headingLevel;
  const name = <span>{item.name}</span>;
  return (
    <>
      <span aria-hidden="true" className="work-row-num">
        {String(item.num ?? index + 1).padStart(2, '0')}
      </span>
      <Heading className="work-row-name">
        <Link
          href={item.href}
          className="work-row-link"
          {...(item.morph ? { transitionTypes: ['morph'], 'data-morph': '' } : {})}
        >
          {item.morph ? (
            <ViewTransition name={item.morph} share="morph" default="none">
              {name}
            </ViewTransition>
          ) : (
            name
          )}
        </Link>
      </Heading>
      {(item.meta || item.year) && (
        <p className="work-row-meta">
          {item.meta && <span>{item.meta}</span>}
          {item.year && <span className="md:text-right">{item.year}</span>}
        </p>
      )}
      <div className="work-row-hook">
        <p>{item.hook}</p>
      </div>
      <ArrowRight aria-hidden="true" className="work-row-arrow icon-strong size-5" />
    </>
  );
}

/** Work as a list of big names between thin rules (C51), numbered in order. */
export function WorkList({
  items,
  headingLevel = 'h3',
}: {
  items: readonly WorkItem[];
  headingLevel?: HeadingLevel;
}) {
  return (
    <ol className="work-list">
      {items.map((item, i) => (
        <li key={item.href} className="work-row">
          <WorkRowBody item={item} index={i} headingLevel={headingLevel} />
        </li>
      ))}
    </ol>
  );
}
