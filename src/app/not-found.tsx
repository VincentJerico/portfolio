import type { Metadata } from 'next';
import Link from 'next/link';
import { LetterTitle } from '@/components/motion/Letters';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex flex-col gap-rhythm">
      {/* A header, so the page arrives like every other page (globals.css header rise). */}
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">404 · Not found</p>
        <LetterTitle text="Page not found" />
        <p className="measure text-lg text-ink-muted">There is nothing at this address.</p>
      </header>
      <ul className="flex flex-wrap gap-3">
        <li>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-mono text-[0.8125rem] text-bg no-underline hover:bg-accent"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 font-mono text-[0.8125rem] text-ink no-underline hover:border-ink"
          >
            Projects
          </Link>
        </li>
      </ul>
    </div>
  );
}
