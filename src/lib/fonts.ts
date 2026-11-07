import { Host_Grotesk } from 'next/font/google';
import localFont from 'next/font/local';

// Decision C39: a quiet Swiss sans for everything people read, and a pixel monospace for everything
// the test runner says. Host Grotesk is one variable file (weight 300 to 800). Departure Mono is not on
// Google Fonts, so its OFL-licensed file ships in src/fonts; it is drawn on an 11 px grid, so mono
// text uses 11 px or 13.75 px (see globals.css).
export const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-host-grotesk',
});

export const departureMono = localFont({
  src: '../fonts/departure-mono/DepartureMono-Regular.woff2',
  display: 'swap',
  variable: '--font-departure-mono',
  fallback: ['ui-monospace', 'Menlo', 'monospace'],
});

export const fontVariables = [hostGrotesk.variable, departureMono.variable].join(' ');
