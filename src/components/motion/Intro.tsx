'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * The first-visit intro (C56): "VJ" on the paper, a line filling to a count of 100, then the paper
 * lifts away like the page sheet. Pure CSS (globals.css), so it plays and ends without JavaScript;
 * the page renders and paints underneath the whole time, and the intro never takes a click or focus.
 * It stays (hidden) until the first page change, then leaves in that same render, so the new page's
 * title rises at once and a page change never replays it. None under reduced motion or in print.
 */
export function Intro() {
  const pathname = usePathname();
  const [first] = useState(pathname);
  if (pathname !== first) return null;
  return (
    <div data-intro data-print-hide aria-hidden="true" className="intro">
      <span className="intro-mark">VJ</span>
      <span className="intro-meter">
        <span className="intro-line" />
        <span className="intro-count" />
      </span>
    </div>
  );
}
