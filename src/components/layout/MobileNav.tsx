'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { identity } from '@/lib/identity';
import { IdentityBlock } from './IdentityBlock';
import { NavList } from './NavList';
import { ShellLinks } from './ShellLinks';

const DRAWER_ID = 'site-drawer';
const DESKTOP_QUERY = '(min-width: 1024px)';

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Top bar + drawer below 1024px. The drawer is a native modal <dialog> opened by an invoker
 * command, so it works without JavaScript; this component adds aria-expanded, a focus wrap,
 * focus return, and closing on navigation or on growing to the desktop layout.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    const onToggle = () => setOpen(dialog.open);
    const onClose = () => {
      setOpen(false);
      if (!desktop.matches) menuRef.current?.focus();
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest('a[href]')) dialog.close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables(dialog);
      const first = items[0];
      const last = items.at(-1);
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
    const onViewport = () => desktop.matches && dialog.open && dialog.close();

    dialog.addEventListener('toggle', onToggle);
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onViewport);
    return () => {
      dialog.removeEventListener('toggle', onToggle);
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onViewport);
    };
  }, []);

  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-chip border border-line font-mono text-xs font-medium text-ink"
        >
          VJ
        </span>
        <p className="min-w-0 flex-1 truncate font-semibold text-ink">{identity.fullName}</p>
        <button
          ref={menuRef}
          type="button"
          commandfor={DRAWER_ID}
          command="show-modal"
          aria-controls={DRAWER_ID}
          aria-expanded={open}
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-chip px-3 text-sm font-medium text-ink hover:bg-surface-2"
        >
          <Menu aria-hidden="true" className="size-5" />
          Menu
        </button>
      </header>

      <dialog
        ref={dialogRef}
        id={DRAWER_ID}
        aria-label="Site menu"
        closedby="any"
        className="drawer m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none overflow-y-auto border-r border-line bg-surface p-0 text-ink backdrop:bg-black/60 lg:hidden"
      >
        <div className="flex min-h-full flex-col gap-6 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <IdentityBlock />
            <button
              type="button"
              commandfor={DRAWER_ID}
              command="close"
              aria-label="Close menu"
              className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-chip text-ink hover:bg-surface-2"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <nav aria-label="Site">
            <NavList />
          </nav>
          <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
            <ThemeToggle className="w-full" />
            <ShellLinks />
          </div>
        </div>
      </dialog>
    </>
  );
}
