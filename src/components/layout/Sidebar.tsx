import { SiteChecksChip } from '@/components/explorer/SiteChecksChip';
import { TestExplorerNav } from '@/components/explorer/TestExplorerNav';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { explorerData } from '@/lib/explorer-rows';
import { IdentityBlock } from './IdentityBlock';
import { ShellLinks } from './ShellLinks';

export function Sidebar() {
  const { rows, projects, summary, site } = explorerData();
  return (
    <aside
      data-print-hide
      className="fixed inset-y-0 left-0 hidden w-[280px] flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-3 py-6 lg:flex"
    >
      <div className="px-2">
        <IdentityBlock />
      </div>
      <TestExplorerNav idPrefix="sidebar" rows={rows} projects={projects} summary={summary} />
      <div className="mt-auto flex flex-col gap-2 border-t border-line px-2 pt-4">
        <ThemeToggle className="w-full" />
        <ShellLinks />
        <RunSuiteButton />
        <SiteChecksChip status={site} />
      </div>
    </aside>
  );
}
