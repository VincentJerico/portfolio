'use client';

import { useEffect } from 'react';
import { scrambleFrame } from '@/lib/decode';

const DURATION_MS = 700;
const FRAME_MS = 28;

/**
 * One delegated listener for every DecodeLabel on the page, installed once the browser is idle so it
 * adds nothing to page load. Hovering a label decodes it; progress is tied to elapsed time, so every
 * label settles in about 0.7 s whatever its length or the machine's speed. It writes to the visible
 * copy's text node in place, so the node React rendered stays the one on the page. Off under
 * reduced motion.
 */
export function DecodeHost() {
  useEffect(() => {
    const running = new WeakSet<Element>();
    const decode = (event: Event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const label = (event.target as Element | null)?.closest?.('.decode');
      const copy = label?.querySelector('[data-decode]');
      const node = copy?.firstChild;
      if (!label || !copy || !(node instanceof Text) || running.has(copy)) return;
      const text = label.querySelector('.sr-only')?.textContent ?? '';
      const frames = text.length * 2;
      const start = performance.now();
      running.add(copy);
      const id = window.setInterval(() => {
        const frame = Math.floor(((performance.now() - start) / DURATION_MS) * frames);
        node.nodeValue = scrambleFrame(text, frame, Math.random);
        if (frame >= frames) {
          window.clearInterval(id);
          node.nodeValue = text;
          running.delete(copy);
        }
      }, FRAME_MS);
    };
    const install = () => document.addEventListener('pointerover', decode);
    const idle = 'requestIdleCallback' in window;
    const handle = idle ? window.requestIdleCallback(install) : window.setTimeout(install, 1200);
    return () => {
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      document.removeEventListener('pointerover', decode);
    };
  }, []);
  return null;
}
