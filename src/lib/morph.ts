const NAME = 'dialog-morph';

/**
 * Morphs one element into another across a state change: `from` carries a shared view-transition name
 * in the old snapshot, the element `update` returns carries it in the new one, and the browser animates
 * the first into the second (a view transition of type "dialog-morph"). `update` must make its change
 * synchronously, for example with flushSync. Without View Transitions, without a `from`, or under
 * reduced motion, it just runs `update`.
 */
export function morph(from: HTMLElement | null | undefined, update: () => HTMLElement | null) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!from || !document.startViewTransition || reduced) {
    update();
    return;
  }
  from.style.viewTransitionName = NAME;
  let to: HTMLElement | null = null;
  const transition = document.startViewTransition({
    update: () => {
      from.style.viewTransitionName = '';
      to = update();
      if (to) to.style.viewTransitionName = NAME;
    },
    types: ['dialog-morph'],
  });
  transition.finished
    .catch(() => {})
    .finally(() => {
      from.style.viewTransitionName = '';
      if (to) to.style.viewTransitionName = '';
    });
}
