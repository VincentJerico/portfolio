'use client';

import { useEffect } from 'react';

const MAX_DEG = 9;

/**
 * One delegated listener for every card marked `data-tilt`: the card tilts toward the cursor in 3D
 * and a soft light (globals.css) follows the pointer, then it settles when the pointer leaves.
 * `data-tilt="soft"` halves the angle. Installed when the browser is idle; mouse only, and off under
 * reduced motion.
 */
export function TiltHost() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    let frame = 0;
    let event: PointerEvent | null = null;
    const reset = (card: HTMLElement) => {
      card.style.transform = '';
      card.removeAttribute('data-tilting');
    };
    const paint = () => {
      frame = 0;
      if (!active || !event) return;
      const box = active.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width;
      const py = (event.clientY - box.top) / box.height;
      const max = active.dataset.tilt === 'soft' ? MAX_DEG / 2 : MAX_DEG;
      active.style.setProperty('--tx', `${(px * 100).toFixed(1)}%`);
      active.style.setProperty('--ty', `${(py * 100).toFixed(1)}%`);
      active.style.transform = `perspective(900px) rotateY(${((px - 0.5) * max * 2).toFixed(2)}deg) rotateX(${((0.5 - py) * max * 2).toFixed(2)}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (card !== active) {
        if (active) reset(active);
        active = card;
        active?.setAttribute('data-tilting', '');
      }
      event = e;
      if (active && !frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };
    const install = () => {
      document.addEventListener('pointermove', onMove);
      document.documentElement.addEventListener('pointerleave', onLeave);
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle ? window.requestIdleCallback(install) : window.setTimeout(install, 1200);
    return () => {
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
