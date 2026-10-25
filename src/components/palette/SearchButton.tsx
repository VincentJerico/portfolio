'use client';

import { Search } from 'lucide-react';
import { OPEN_PALETTE } from './CommandPaletteRoot';

export function SearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))}
      className="flex min-h-11 w-full items-center gap-3 rounded-chip border border-line bg-bg px-2.5 text-sm text-ink-muted hover:text-ink"
    >
      <Search aria-hidden="true" className="size-4" />
      Search
      <kbd
        aria-hidden="true"
        className="ml-auto rounded-[3px] border border-line px-1.5 font-mono text-[0.6875rem]"
      >
        Ctrl K
      </kbd>
    </button>
  );
}
