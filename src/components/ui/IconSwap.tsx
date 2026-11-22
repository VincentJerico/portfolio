import type { ReactNode } from 'react';

/**
 * Two icons stacked in one place; `show` picks which is visible. The swap runs through blur and scale
 * (globals.css, C54): the leaving icon blurs and shrinks away while the arriving one sharpens in.
 * Decorative: the control around it carries the name and state.
 */
export function IconSwap({
  show,
  first,
  second,
}: {
  show: 'first' | 'second';
  first: ReactNode;
  second: ReactNode;
}) {
  return (
    <span className="icon-swap" data-show={show} aria-hidden="true">
      {first}
      {second}
    </span>
  );
}
