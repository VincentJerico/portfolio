import { Archivo, Martian_Mono } from 'next/font/google';

// One variable file each. Archivo's width axis does the display work: headings are set condensed and
// heavy like a spec-sheet label, body text at normal width. Martian Mono, set slightly condensed,
// carries the test-runner data.
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
});

export const martianMono = Martian_Mono({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-martian-mono',
});

export const fontVariables = [archivo.variable, martianMono.variable].join(' ');
