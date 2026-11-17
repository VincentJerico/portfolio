'use client';

import { Search } from 'lucide-react';
import { OPEN_PALETTE } from './CommandPaletteRoot';

/** Opens the command palette. In the top bar (`bar`) it is an icon until there is room for its label. */
export function SearchButton({ bar = false }: { bar?: boolean }) {
  return (
    <button
      type="button"
      // Pass the button itself: Safari doesn't focus buttons on click, so activeElement would be <body>.
      onClick={(event) =>
        window.dispatchEvent(new CustomEvent(OPEN_PALETTE, { detail: event.currentTarget }))
      }
      className={`flex min-h-11 items-center gap-3 rounded-chip border border-line bg-bg text-sm text-ink-muted hover:text-ink ${
        bar ? 'w-11 justify-center xl:w-56 xl:justify-start xl:px-2.5' : 'w-full px-2.5'
      }`}
    >
      <Search aria-hidden="true" className="size-4" />
      <span className={bar ? 'sr-only xl:not-sr-only' : ''}>Search</span>
      <kbd
        aria-hidden="true"
        className={`ml-auto rounded-[3px] border border-line px-1.5 font-mono text-[0.6875rem] ${
          bar ? 'hidden xl:inline' : ''
        }`}
      >
        Ctrl K
      </kbd>
    </button>
  );
}
