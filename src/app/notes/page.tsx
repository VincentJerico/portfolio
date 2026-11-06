import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { visibleNotes } from '@/content/notes';
import { formatDay } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Notes',
  description: 'Short notes on software testing and QA from Vincent Jerico Alcuran.',
  path: '/notes',
});

export default function NotesPage() {
  const notes = visibleNotes();
  // The section does not exist until the first note is published (decision C30).
  if (notes.length === 0) notFound();

  return (
    <div className="flex flex-col gap-14">
      <header className="measure">
        <p className="label-mono text-ink-muted">Notes</p>
        <h1 className="mt-4">Notes</h1>
      </header>
      <ul className="flex flex-col gap-6">
        {notes.map((note) => (
          <li
            key={note.slug}
            className="measure flex flex-col gap-1 rounded-card border border-line bg-surface p-5"
          >
            <p className="label-mono text-ink-muted">
              <time dateTime={note.date}>{formatDay(note.date)}</time>
            </p>
            <h2 className="text-xl">
              <Link href={`/notes/${note.slug}`} className="inline-flex min-h-11 items-center">
                {note.title}
              </Link>
            </h2>
            <p className="text-ink-muted">{note.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
