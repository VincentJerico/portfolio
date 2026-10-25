import type { Metadata } from 'next';
import { IdentityBlock } from '@/components/layout/IdentityBlock';
import { MobileNav } from '@/components/layout/MobileNav';
import { ShellLinks } from '@/components/layout/ShellLinks';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/layout/SkipLink';
import { BugHuntProvider } from '@/components/bughunt/BugHuntProvider';
import { BugHuntToggle } from '@/components/bughunt/BugHuntToggle';
import { HuntBanner } from '@/components/bughunt/HuntBanner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';
import { profile } from '@/content';
import { fontVariables } from '@/lib/fonts';
import { explorerData } from '@/lib/explorer-rows';
import { SiteChecksChip } from '@/components/explorer/SiteChecksChip';
import { TestExplorerNav } from '@/components/explorer/TestExplorerNav';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET',
    template: '%s · Vincent Jerico Alcuran',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const { rows, projects, summary, site } = explorerData();
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
                <TestExplorerNav
                  idPrefix="drawer"
                  rows={rows}
                  projects={projects}
                  summary={summary}
                />
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
                {children}
              </div>
            </main>
          </BugHuntProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
