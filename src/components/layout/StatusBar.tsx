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
 * Desktop status bar along the bottom (from 1024px), kept minimal: exploration coverage on the left,
 * then icons for Run tests, Bug Hunt and site checks, Vincent's local time and his links on the right.
 * Each icon names itself to screen readers and in a tooltip on hover or focus. Below 1024px the drawer
 * carries all of these.
 */
export function StatusBar() {
  const { rows, summary, site } = explorerData();
  return (
    <footer
      data-statusbar
      data-print-hide
      aria-label="Status"
      className="fixed inset-x-0 bottom-0 z-30 hidden h-11 items-center justify-between border-t border-line bg-bg/85 px-4 backdrop-blur lg:flex"
    >
      <CoverageMeter hrefs={rows.map((row) => row.href)} />
      <div className="flex items-center">
        <RunSuiteButton iconOnly />
        <BugHuntToggle bar />
        <SiteChecksChip status={site} bar summary={summary} />
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-line" />
        <LocalTime utcOffsetMinutes={MANILA_UTC_OFFSET_MINUTES} place={profile.location} compact />
        <ShellLinks bar />
      </div>
    </footer>
  );
}
