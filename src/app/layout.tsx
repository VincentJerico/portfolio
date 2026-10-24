import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
