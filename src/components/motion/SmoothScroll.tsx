'use client';

import { useEffect } from 'react';

const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)';

/** Lenis's settings (C53: a longer glide). */
export const LENIS_OPTIONS = {
  autoRaf: true,
  lerp: 0.075,
  anchors: true,
  // An internal link stops any glide, so a page change's scroll to the top is never fought.
  stopInertiaOnNavigate: true,
  // A wheel or swipe over something that can scroll that way itself (a wide table, a code block)
  // scrolls it natively instead of the page.
  allowNestedScroll: true,
  prevent: (node: HTMLElement) => node.closest('dialog[open], [data-lenis-prevent]') !== null,
};

/**
 * Smooth wheel and trackpad scrolling (C52, move 9). Only for a fine pointer with motion allowed;
 * touch, the keyboard, reduced motion and open dialogs keep the browser's own scrolling. Lenis is
 * loaded when the browser is idle, in its own chunk, so it never weighs on the first load. It scrolls
 * the page itself, so the CSS scroll-driven animations keep following it.
 */
export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    let lenis: { destroy(): void } | undefined;
    let cancelled = false;

    const start = async () => {
      const { default: Lenis } = await import('lenis');
      if (cancelled || lenis || !media.matches) return;
      lenis = new Lenis(LENIS_OPTIONS);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = undefined;
    };
    const sync = () => (media.matches ? void start() : stop());

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(sync)
      : window.setTimeout(sync, 200);
    media.addEventListener('change', sync);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      media.removeEventListener('change', sync);
      stop();
    };
  }, []);

  return null;
}
