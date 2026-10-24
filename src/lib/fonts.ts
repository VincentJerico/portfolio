import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from 'next/font/google';

// Plex Sans is variable (one file for 400 body and 600 headings).
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-sans',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

export const fontVariables = [plexSans.variable, plexMono.variable, instrumentSerif.variable].join(
  ' ',
);
