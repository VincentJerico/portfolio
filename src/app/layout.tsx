import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import { BugHuntProvider } from '@/components/bughunt/BugHuntProvider';
import { BugHuntToggle } from '@/components/bughunt/BugHuntToggle';
import { HuntBanner } from '@/components/bughunt/HuntBanner';
import { NextSpec } from '@/components/content/NextSpec';
import { SiteChecksChip } from '@/components/explorer/SiteChecksChip';
import { TestExplorerNav } from '@/components/explorer/TestExplorerNav';
import { IdentityBlock } from '@/components/layout/IdentityBlock';
import { MobileNav } from '@/components/layout/MobileNav';
import { ShellLinks } from '@/components/layout/ShellLinks';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/layout/SkipLink';
import { CommandPaletteRoot } from '@/components/palette/CommandPaletteRoot';
import { SearchButton } from '@/components/palette/SearchButton';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RunnerHost } from '@/components/runner/RunnerHost';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';
import { profile } from '@/content';
import { explorerData } from '@/lib/explorer-rows';
import { fontVariables } from '@/lib/fonts';
import { paletteItems, siteReadingOrder } from '@/lib/site-index';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET',
    template: '%s · Vincent Jerico Alcuran',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const { rows, projects, summary, site } = explorerData();
  const { order, reportsWithNext } = siteReadingOrder();
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BugHuntProvider>
            <SkipLink />
            <MobileNav
              fullName={profile.fullName}
              identity={<IdentityBlock />}
              nav={
                <>
                  <SearchButton />
                  <TestExplorerNav
                    idPrefix="drawer"
                    rows={rows}
                    projects={projects}
                    summary={summary}
                  />
                </>
              }
              links={
                <>
                  <ShellLinks />
                  <RunSuiteButton />
                  <BugHuntToggle />
                  <SiteChecksChip status={site} />
                </>
              }
            />
            <Sidebar />
            <main id="main" tabIndex={-1} className="focus:outline-none lg:pl-[280px]">
              <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
                <HuntBanner email={profile.email} />
                {/* P5: route changes cross-fade (off under reduced motion, see globals.css). */}
                <ViewTransition>{children}</ViewTransition>
                <NextSpec order={order} reportsWithNext={reportsWithNext} />
              </div>
            </main>
            <CommandPaletteRoot items={paletteItems()} />
            <RunnerHost />
          </BugHuntProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
