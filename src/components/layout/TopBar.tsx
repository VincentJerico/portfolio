import Link from 'next/link';
import { TopNav } from '@/components/explorer/TopNav';
import { SearchButton } from '@/components/palette/SearchButton';
import { profile } from '@/content';
import { explorerData } from '@/lib/explorer-rows';

/**
 * Desktop top bar (from 1024px; below that MobileNav's bar and drawer take over): the name, the pages
 * with their status dots, and Search. It leaves room at the right for the pull cord, which hangs below
 * it. The name shows in full once there is room; until then a monogram stands in.
 */
export function TopBar() {
  const { rows, projects } = explorerData();
  return (
    <header
      data-topbar
      data-print-hide
      className="fixed inset-x-0 top-0 z-30 hidden h-14 items-center gap-4 border-b border-line bg-secondary/95 pr-16 pl-6 backdrop-blur lg:flex"
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 font-semibold text-ink no-underline"
      >
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-chip border border-line font-mono text-xs font-medium"
        >
          VJ
        </span>
        <span className="sr-only 2xl:not-sr-only">{profile.fullName}</span>
      </Link>
      <TopNav rows={rows} projects={projects} />
      <div className="ml-auto shrink-0">
        <SearchButton bar />
      </div>
    </header>
  );
}
