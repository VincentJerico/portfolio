import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { RouteTransition } from '@/components/layout/RouteTransition';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { profile } from '@/content';
import { getEnv } from '@/lib/env';
import { fontVariables } from '@/lib/fonts';
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

// The minimal shell (C51): a plain top bar, the page, and a footer. Nothing else.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SkipLink />
          <SiteHeader />
          {/* The sheet that slides in on a page change: the page and its footer, full width and at
              least a screen tall under the top bar, so it covers the old page everywhere. */}
          <RouteTransition>
            <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col print:min-h-0">
              <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
                <div className="shell pt-6 pb-4 lg:pt-10">{children}</div>
              </main>
              <SiteFooter />
            </div>
          </RouteTransition>
          {/* Last in the body: Chrome can paint before it has parsed the content, and the grain alone
              would then be the first contentful paint, which Lighthouse's LCP estimate punishes. */}
          <div data-paper-grain data-print-hide />
          <SmoothScroll />
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
