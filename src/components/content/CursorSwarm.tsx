'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

// Fine pointers only (no swarm for touch) and never under reduced motion.
const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)';
const COUNT = 36;

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Each agent orbits the pointer on its own ring, phase and speed, so the swarm never collapses. */
  ring: number;
  phase: number;
  spin: number;
}

/**
 * A swarm of test workers that gathers around the pointer while it is over the parent element, and
 * disperses and fades when it leaves. Motion only ever answers the pointer: with no pointer the
 * swarm settles and the loop stops (WCAG 2.2.2). Decorative and hidden from assistive tech.
 */
export function CursorSwarm() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!enabled || !canvas || !host || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let active = false;
    let alpha = 0;
    let color = '#58a6ff';
    const pointer = { x: 0, y: 0 };
    const agents: Agent[] = [];

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      agents.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;
        agents.push({
          x: pointer.x + Math.cos(angle) * 4,
          y: pointer.y + Math.sin(angle) * 4,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          ring: 28 + Math.random() * 64,
          phase: angle,
          spin: (0.008 + Math.random() * 0.018) * (i % 2 ? 1 : -1),
        });
      }
    };

    const step = () => {
      frame = 0;
      alpha += ((active ? 1 : 0) - alpha) * 0.08;
      for (const a of agents) {
        a.phase += a.spin;
        if (active) {
          a.vx += (pointer.x + Math.cos(a.phase) * a.ring - a.x) * 0.012;
          a.vy += (pointer.y + Math.sin(a.phase) * a.ring - a.y) * 0.012;
        } else {
          // Scatter away from the last pointer position while fading out.
          a.vx += (a.x - pointer.x) * 0.002;
          a.vy += (a.y - pointer.y) * 0.002;
        }
        for (const b of agents) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (b !== a && d2 < 196 && d2 > 0) {
            a.vx += (dx / d2) * 1.4;
            a.vy += (dy / d2) * 1.4;
          }
        }
        a.vx *= 0.88;
        a.vy *= 0.88;
        a.x += a.vx;
        a.y += a.vy;
      }

      // Short trails: erase a little of the last frame instead of all of it.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = color;
      for (const a of agents) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!active && alpha < 0.01) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      if (visible) frame = requestAnimationFrame(step);
    };

    const run = () => {
      if (!frame && visible) frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (!active) {
        // Read the theme's accent each time the swarm forms, so it follows a theme switch.
        color =
          getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || color;
        if (alpha < 0.01) spawn();
        active = true;
      }
      run();
    };
    const onLeave = () => {
      active = false;
      run();
    };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) run();
    });
    viewObserver.observe(host);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-cursor-swarm
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full print:hidden"
    />
  );
}
