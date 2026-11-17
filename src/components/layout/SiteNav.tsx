'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive, type NavItem } from '@/lib/nav';

/** A list of page links that marks the page you are on (aria-current), also inside its section. */
export function SiteNav({
  items,
  label,
  className = '',
  listClassName = '',
  linkClassName = '',
}: {
  items: readonly NavItem[];
  label: string;
  className?: string;
  listClassName?: string;
  linkClassName?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={className}>
      <ul className={listClassName}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={linkClassName}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
