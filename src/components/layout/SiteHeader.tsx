import Link from 'next/link';
import { profile } from '@/content';
import { footerNavItems, primaryNavItems } from '@/lib/nav-items';
import { SiteMenu } from './SiteMenu';
import { SiteNav } from './SiteNav';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * The top bar (C51): the name on the left; the main pages, the theme switch and (on phones) Menu on
 * the right. Small mono type on the page's own paper, so it reads as part of the poster.
 */
export function SiteHeader() {
  const items = primaryNavItems();
  return (
    <header data-site-header data-print-hide className="sticky top-0 z-30 bg-bg">
      <div className="shell flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-mono text-[0.8125rem] text-ink no-underline hover:text-accent"
        >
          <span className="sm:hidden">{profile.displayName}</span>
          <span className="hidden sm:inline">{profile.fullName}</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-5">
          <SiteNav
            items={items}
            label="Site"
            className="hidden md:block"
            listClassName="flex items-center gap-5"
            linkClassName="nav-link"
          />
          <ThemeSwitch />
          <SiteMenu items={items} more={footerNavItems()} />
        </div>
      </div>
    </header>
  );
}
