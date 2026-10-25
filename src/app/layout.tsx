import type { Metadata } from 'next';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipLink } from '@/components/layout/SkipLink';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET',
    template: '%s · Vincent Jerico Alcuran',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SkipLink />
          <MobileNav />
          <Sidebar />
          <main id="main" tabIndex={-1} className="focus:outline-none lg:pl-[280px]">
            <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
