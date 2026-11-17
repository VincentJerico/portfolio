'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { markVisited } from '@/lib/coverage';
import { isActive } from '@/lib/nav';
import { STATUS_TEXT, StatusDot, type ExplorerRow } from './TestExplorerNav';

/**
 * The desktop site nav in the top bar: each page with its CI status dot, one underline marker under
 * the active page (it keeps one view-transition name, so it glides to the new page on navigation),
 * and a menu of the project specs beside Projects. It also records exploration coverage, which the
 * status bar reports.
 */
export function TopNav({
  rows,
  projects,
}: {
  rows: readonly ExplorerRow[];
  projects: readonly ExplorerRow[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPath, setMenuPath] = useState(pathname);

  useEffect(() => {
    markVisited(pathname);
  }, [pathname]);

  // A page change closes the menu (render-time reset, so no effect has to set state).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Esc and a click outside close the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  return (
    <nav aria-label="Site" className="min-w-0">
      <ul className="flex items-center">
        {rows.map((row) => {
          const active = isActive(pathname, row.href);
          const isProjects = row.href === '/projects';
          return (
            <li key={row.href} className="flex items-center">
              {/* Status first and outside the link, so each link's name is just the page name. */}
              <span className="sr-only">{STATUS_TEXT[row.status]}</span>
              <Link
                href={row.href}
                aria-current={active ? 'page' : undefined}
                className="group relative inline-flex h-14 items-center gap-2 px-2.5 text-sm text-ink-muted no-underline hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
              >
                <StatusDot status={row.status} />
                {row.label}
                {active && (
                  <span
                    aria-hidden="true"
                    data-nav-marker
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                    style={{ viewTransitionName: 'nav-active-topbar' }}
                  />
                )}
              </Link>
              {isProjects && (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Project specs"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    onClick={() => setMenuOpen((open) => !open)}
                    className="-ml-1 inline-flex size-11 items-center justify-center rounded-chip text-ink-muted hover:bg-surface-2 hover:text-ink"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <ul
                    id={menuId}
                    hidden={!menuOpen}
                    className="topnav-menu absolute top-full left-0 z-40 mt-1 w-72 rounded-card border border-line bg-surface p-1.5 shadow-card"
                  >
                    {projects.map((project) => (
                      <li key={project.href}>
                        <span className="sr-only">{STATUS_TEXT[project.status]}</span>
                        <Link
                          href={project.href}
                          aria-current={pathname === project.href ? 'page' : undefined}
                          className="flex min-h-11 items-center gap-2.5 rounded-chip px-2.5 text-sm text-ink-muted no-underline hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                        >
                          <StatusDot status={project.status} />
                          <span className="min-w-0 truncate font-mono">{project.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
