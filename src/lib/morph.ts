const NAME = 'dialog-morph';

/** How long a view transition may take to reach its update before the change happens without it. */
export const MORPH_WATCHDOG_MS = 400;

/**
 * Morphs one element into another across a state change: `from` carries a shared view-transition name
 * in the old snapshot, the element `update` returns carries it in the new one, and the browser animates
 * the first into the second (a view transition of type "dialog-morph"). `update` must make its change
 * synchronously, for example with flushSync. Without View Transitions, without a `from`, or under
 * reduced motion, it just runs `update`.
 *
 * WebKit has been seen to start a transition and never reach its update (CI, 2026-11), which left a
 * click that opened nothing. So the update runs on its own after MORPH_WATCHDOG_MS, the animation is
 * skipped, and the update still runs only once.
 */
export function morph(from: HTMLElement | null | undefined, update: () => HTMLElement | null) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!from || !document.startViewTransition || reduced) {
    update();
    return;
  }
  from.style.viewTransitionName = NAME;
  let to: HTMLElement | null = null;
  let ran = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    if (ran) return;
    ran = true;
    clearTimeout(watchdog);
    from.style.viewTransitionName = '';
    to = update();
    if (to) to.style.viewTransitionName = NAME;
  };
  const transition = document.startViewTransition({ update: run, types: ['dialog-morph'] });
  if (!ran)
    watchdog = setTimeout(() => {
      run();
      transition.skipTransition();
    }, MORPH_WATCHDOG_MS);
  // A change that fails inside the transition would otherwise vanish with it, and the click would
  // look like it did nothing. A skipped animation still lands in `finished`, which stays quiet.
  transition.updateCallbackDone.catch((error: unknown) => console.error(error));
  transition.finished
    .catch(() => {})
    .finally(() => {
      from.style.viewTransitionName = '';
      if (to) to.style.viewTransitionName = '';
    });
}
