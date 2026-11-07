import { Geist, Geist_Mono } from 'next/font/google';

// Decision C39: Geist for everything people read and Geist Mono for everything the test runner says.
// Both are variable (weight 100 to 900) and built for legibility at small sizes, which the dense
// runner labels need (Vincent picked them over a pixel mono that read poorly at 11 px).
export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const fontVariables = [geist.variable, geistMono.variable].join(' ');
