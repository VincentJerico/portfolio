'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { flushSync } from 'react-dom';
import { morph } from '@/lib/morph';
import type { PaletteItem } from './CommandPalette';

export const OPEN_PALETTE = 'vj:open-palette';
type Palette = ComponentType<{ items: PaletteItem[]; onClose: () => void }>;

/**
 * P3: listens for Cmd/Ctrl+K (a modifier, so WCAG 2.1.4 safe) and Search buttons, and loads the
 * palette UI on first use only.
 */
export function CommandPaletteRoot({ items }: { items: PaletteItem[] }) {
  const [Palette, setPalette] = useState<Palette | null>(null);
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const show = useCallback(
    async (opener?: HTMLElement) => {
      openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
      let Loaded = Palette;
      if (!Loaded) {
        const palette = await import('./CommandPalette');
        Loaded = palette.CommandPalette;
      }
      const Component = Loaded;
      // The Search button grows into the palette (a keyboard shortcut has no button to grow from).
      morph(opener, () => {
        flushSync(() => {
          setPalette(() => Component);
          setOpen(true);
        });
        return document.querySelector<HTMLElement>('dialog[open][aria-label="Search"]');
      });
    },
    [Palette],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        void show();
      }
    };
    const onOpen = (event: Event) => void show((event as CustomEvent<HTMLElement>).detail);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, [show]);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);

  return open && Palette ? <Palette items={items} onClose={close} /> : null;
}
