import { Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google';

// Decision C49 (Vincent's pick, "Workshop"): Bricolage Grotesque for everything people read and IBM
// Plex Mono for everything the test runner says. Bricolage is variable in weight and optical size, so
// large titles take its tighter display cuts while body text stays even; Plex Mono holds up at the
// 11 to 12 px the runner labels use.
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz', 'wdth'],
  variable: '--font-bricolage',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const fontVariables = [bricolage.variable, plexMono.variable].join(' ');
