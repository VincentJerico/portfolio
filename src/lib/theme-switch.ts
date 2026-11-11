import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

/**
 * Switches the theme by flooding the page with it: a circle of the new theme grows from the point the
 * visitor pressed until it covers the viewport (a view transition of type "theme"). The theme class is
 * applied inside the transition's update so the snapshot is exact; next-themes then stores the choice.
 * Without View Transitions, or under reduced motion, the theme simply switches.
 */
export function switchTheme(next: Theme, setTheme: (theme: Theme) => void, from?: HTMLElement) {
  const apply = () => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    apply();
    return;
  }
  const box = from?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth - 24;
  const y = box ? box.top + box.height / 2 : 24;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const transition = document.startViewTransition({ update: apply, types: ['theme'] });
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 650,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {});
}
