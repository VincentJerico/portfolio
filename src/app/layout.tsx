import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { BugHuntProvider } from '@/components/bughunt/BugHuntProvider';
import { BugHuntToggle } from '@/components/bughunt/BugHuntToggle';
import { HuntBanner } from '@/components/bughunt/HuntBanner';
import { NextSpec } from '@/components/content/NextSpec';
import { SiteChecksChip } from '@/components/explorer/SiteChecksChip';
import { TestExplorerNav } from '@/components/explorer/TestExplorerNav';
import { Boot, BOOT_SCRIPT } from '@/components/layout/Boot';
import { IdentityBlock } from '@/components/layout/IdentityBlock';
import { MobileNav } from '@/components/layout/MobileNav';
import { PullCord } from '@/components/layout/PullCord';
import { RouteRunner } from '@/components/layout/RouteRunner';
import { RouteTransition } from '@/components/layout/RouteTransition';
import { ShellLinks } from '@/components/layout/ShellLinks';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/layout/SkipLink';
import { CommandPaletteRoot } from '@/components/palette/CommandPaletteRoot';
import { SearchButton } from '@/components/palette/SearchButton';
import { DecodeHost } from '@/components/ui/DecodeHost';
import { TiltHost } from '@/components/ui/TiltHost';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RunnerHost } from '@/components/runner/RunnerHost';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';
import { profile } from '@/content';
import { getEnv } from '@/lib/env';
import { explorerData } from '@/lib/explorer-rows';
import { fontVariables } from '@/lib/fonts';
import { paletteItems, siteReadingOrder } from '@/lib/site-index';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(getEnv().NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET',
    template: '%s · Vincent Jerico Alcuran',
  },
  description: profile.oneLiner,
  openGraph: { type: 'website', siteName: profile.fullName, locale: 'en' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const { rows, projects, summary, site } = explorerData();
  const { order, reportsWithNext } = siteReadingOrder();
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Boot />
        {/* A pass-green run bar sweeps across the top on every full page load (globals.css). */}
        <div data-load-bar aria-hidden="true" className="load-bar" data-print-hide />
        <div data-scroll-progress aria-hidden="true" className="scroll-progress" data-print-hide />
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
            <PullCord />
            <main id="main" tabIndex={-1} className="focus:outline-none lg:pl-[280px]">
              <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
                <HuntBanner email={profile.email} />
                <RouteTransition>{children}</RouteTransition>
                <NextSpec order={order} reportsWithNext={reportsWithNext} />
              </div>
            </main>
            <CommandPaletteRoot items={paletteItems()} />
            <RunnerHost />
            <RouteRunner
              specs={[...rows, ...projects].map(({ href, spec, status }) => ({
                href,
                spec,
                status,
              }))}
            />
            <DecodeHost />
            <TiltHost />
          </BugHuntProvider>
          {/* Cookieless analytics, only on Vercel builds: elsewhere their first-party scripts 404. */}
          {process.env.VERCEL === '1' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
