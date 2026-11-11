'use client';

import { useEffect, useRef } from 'react';

/**
 * A field of test dots behind the hero. Where the cursor is, the dots turn pass-green and a scan ring
 * pulses out from it. One pointer listener on the hero, updated once per frame; nothing runs until the
 * pointer moves. Decorative and pointer-transparent. On touch screens and under reduced motion only
 * the quiet dot field shows (globals.css).
 */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = ref.current;
    const hero = grid?.parentElement;
    if (!grid || !hero) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      grid.style.setProperty('--mx', `${x}px`);
      grid.style.setProperty('--my', `${y}px`);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = grid.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      grid.setAttribute('data-active', '');
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => grid.removeAttribute('data-active');
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div ref={ref} data-spotlight aria-hidden="true" className="spotlight" data-print-hide>
      <div className="spotlight-dots" />
      <div className="spotlight-lit" />
      <div className="spotlight-ring" />
    </div>
  );
}
