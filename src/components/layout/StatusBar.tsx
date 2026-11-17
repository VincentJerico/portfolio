import Link from 'next/link';
import { BugHuntToggle } from '@/components/bughunt/BugHuntToggle';
import { CoverageMeter } from '@/components/explorer/CoverageMeter';
import { SiteChecksChip } from '@/components/explorer/SiteChecksChip';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';
import { profile } from '@/content';
import { MANILA_UTC_OFFSET_MINUTES } from '@/lib/clock';
import { explorerData } from '@/lib/explorer-rows';
import { LocalTime } from './LocalTime';
import { ShellLinks } from './ShellLinks';

/**
 * Desktop status bar along the bottom (from 1024px), like an IDE's status line: the site's run
 * summary, exploration coverage, Run tests, Bug Hunt, site checks, Vincent's local time and his links.
 * Below 1024px the drawer carries all of these.
 */
export function StatusBar() {
  const { rows, summary, site } = explorerData();
  return (
    <footer
      data-statusbar
      data-print-hide
      aria-label="Status"
      className="fixed inset-x-0 bottom-0 z-30 hidden h-11 items-center gap-1 border-t border-line bg-secondary/95 px-3 font-mono text-[0.6875rem] whitespace-nowrap text-ink-muted backdrop-blur lg:flex"
    >
      <Link
        href="/quality"
        className="inline-flex min-h-11 items-center gap-2 px-2 text-ink-muted no-underline hover:text-ink"
      >
        <span className="font-medium text-ink">portfolio.spec</span>
        <span className="hidden 2xl:inline">{summary}</span>
      </Link>
      <span aria-hidden="true" className="h-4 w-px bg-line" />
      <CoverageMeter hrefs={rows.map((row) => row.href)} />
      <span aria-hidden="true" className="h-4 w-px bg-line" />
      <RunSuiteButton className="text-[0.6875rem]!" />
      <BugHuntToggle bar />
      <SiteChecksChip status={site} bar />
      <div className="ml-auto flex items-center gap-1">
        <div className="hidden px-2 2xl:block">
          <LocalTime utcOffsetMinutes={MANILA_UTC_OFFSET_MINUTES} place={profile.location} />
        </div>
        <ShellLinks bar />
      </div>
    </footer>
  );
}
