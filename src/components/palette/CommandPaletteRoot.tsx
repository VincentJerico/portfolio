'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
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

  const show = useCallback(async () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    if (!Palette) {
      const palette = await import('./CommandPalette');
      setPalette(() => palette.CommandPalette);
    }
    setOpen(true);
  }, [Palette]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        void show();
      }
    };
    const onOpen = () => void show();
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
