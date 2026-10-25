'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive, type NavItem } from '@/lib/nav';

export function NavList({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex min-h-11 items-center rounded-chip px-3 text-[0.9375rem] text-ink-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2 aria-[current=page]:before:left-0 aria-[current=page]:before:w-0.5 aria-[current=page]:before:rounded-full aria-[current=page]:before:bg-accent"
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
