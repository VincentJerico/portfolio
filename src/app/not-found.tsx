import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="measure">
      <p className="label-mono text-ink-muted">404 · Not found</p>
      <h1 className="mt-3">Page not found</h1>
      <p className="mt-4 text-ink-muted">There is nothing at this address.</p>
      <ul className="mt-6 flex flex-wrap gap-3">
        <li>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-chip bg-accent px-4 font-semibold text-bg no-underline"
          >
            Overview
          </Link>
        </li>
        <li>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center rounded-chip border border-line px-4 font-semibold text-ink no-underline hover:bg-surface-2"
          >
            Projects
          </Link>
        </li>
      </ul>
    </div>
  );
}
