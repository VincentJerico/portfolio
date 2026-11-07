'use client';

import { useEffect } from 'react';
import { scrambleFrame } from '@/lib/decode';

const FRAME_MS = 28;

/**
 * One delegated listener for every DecodeLabel on the page, installed once the browser is idle so it
 * adds nothing to page load. Off under reduced motion.
 */
export function DecodeHost() {
  useEffect(() => {
    const running = new WeakSet<Element>();
    const decode = (event: Event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const label = (event.target as Element | null)?.closest?.('.decode');
      const copy = label?.querySelector('[data-decode]');
      if (!label || !copy || running.has(copy)) return;
      const text = label.querySelector('.sr-only')?.textContent ?? '';
      running.add(copy);
      let frame = 0;
      const id = window.setInterval(() => {
        copy.textContent = scrambleFrame(text, frame, Math.random);
        if (++frame > text.length * 2) {
          window.clearInterval(id);
          copy.textContent = text;
          running.delete(copy);
        }
      }, FRAME_MS);
    };
    const install = () => {
      document.addEventListener('pointerover', decode);
      document.addEventListener('focusin', decode);
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle ? window.requestIdleCallback(install) : window.setTimeout(install, 1200);
    return () => {
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      document.removeEventListener('pointerover', decode);
      document.removeEventListener('focusin', decode);
    };
  }, []);
  return null;
}
