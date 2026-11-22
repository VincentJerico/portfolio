'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { NavItem } from '@/lib/nav';
import { SiteNav } from './SiteNav';

const MENU_ID = 'site-menu';
const WIDE_QUERY = '(min-width: 768px)';

// iOS < 26.2 (and webviews on it) lacks invoker commands; fall back to the dialog API there.
function supportsInvokers(): boolean {
  return 'command' in HTMLButtonElement.prototype;
}

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * The phone menu (below 768 px): "Menu" opens a full-screen list of big page links. It is a native
 * modal <dialog> opened by an invoker command, so it opens without JavaScript; this component adds
 * aria-expanded, a focus wrap, focus return, and closing on navigation or on growing to the wide
 * layout, where the top bar shows the links itself.
 */
export function SiteMenu({ items, more }: { items: readonly NavItem[]; more: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const wide = window.matchMedia(WIDE_QUERY);

    const onToggle = () => setOpen(dialog.open);
    const onClose = () => {
      setOpen(false);
      if (!wide.matches) menuRef.current?.focus();
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest('a[href]')) dialog.close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const all = focusables(dialog);
      const first = all[0];
      const last = all.at(-1);
      if (!first || !last) return;
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onViewport = () => wide.matches && dialog.open && dialog.close();

    dialog.addEventListener('toggle', onToggle);
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);
    wide.addEventListener('change', onViewport);
    // The invoker opens the menu without JavaScript, so it may already be open at hydration.
    onToggle();
    return () => {
      dialog.removeEventListener('toggle', onToggle);
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      wide.removeEventListener('change', onViewport);
    };
  }, []);

  // Close on navigation only. Running this on mount would shut a menu opened before hydration.
  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        ref={menuRef}
        type="button"
        commandfor={MENU_ID}
        command="show-modal"
        onClick={(event) => {
          // The menu grows as a circle from this button (C55 D10): its centre, in screen pixels.
          const box = event.currentTarget.getBoundingClientRect();
          const x = box.left + box.width / 2;
          const y = box.top + box.height / 2;
          // Just large enough to reach the farthest corner, so the circle is seen growing throughout.
          const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
          const style = dialogRef.current?.style;
          style?.setProperty('--menu-x', `${x}px`);
          style?.setProperty('--menu-y', `${y}px`);
          style?.setProperty('--menu-r', `${r}px`);
          if (!supportsInvokers()) dialogRef.current?.showModal();
        }}
        aria-controls={MENU_ID}
        aria-expanded={open}
        className="inline-flex min-h-11 items-center px-2 font-mono text-[0.8125rem] text-ink hover:text-accent md:hidden"
      >
        Menu
      </button>
      <dialog
        data-print-hide
        ref={dialogRef}
        id={MENU_ID}
        aria-label="Site menu"
        closedby="any"
        className="site-menu m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-(--layer-2) p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-ink shadow-(--layer-highlight) backdrop:bg-[var(--backdrop)] md:hidden"
      >
        <div className="shell flex min-h-full flex-col pb-8">
          <div className="flex h-14 items-center justify-end">
            <button
              type="button"
              commandfor={MENU_ID}
              command="close"
              onClick={() => supportsInvokers() || dialogRef.current?.close()}
              className="inline-flex min-h-11 items-center px-2 font-mono text-[0.8125rem] text-ink hover:text-accent"
            >
              Close<span className="sr-only"> menu</span>
            </button>
          </div>
          <SiteNav
            items={items}
            label="Pages"
            className="mt-6"
            listClassName="flex flex-col"
            linkClassName="menu-link"
          />
          <SiteNav
            items={more}
            label="More pages"
            className="mt-auto pt-10"
            listClassName="flex flex-wrap gap-x-6 font-mono text-[0.8125rem]"
            linkClassName="inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-accent"
          />
        </div>
      </dialog>
    </>
  );
}
