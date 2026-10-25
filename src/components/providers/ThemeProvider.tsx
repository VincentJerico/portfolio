'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

// OS preference wins until the visitor picks a theme; dark is the CSS default without JS (C11).
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      value={{ light: 'light', dark: 'dark' }}
    >
      {children}
    </NextThemesProvider>
  );
}
