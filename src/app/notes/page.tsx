import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkList } from '@/components/content/WorkList';
import { visibleNotes } from '@/content/notes';
import { formatDay } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { LetterTitle } from '@/components/motion/Letters';

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
    <div className="flex flex-col gap-rhythm">
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">Notes</p>
        <LetterTitle text="Notes" />
      </header>
      <WorkList
        headingLevel="h2"
        items={notes.map((note) => ({
          href: `/notes/${note.slug}`,
          name: note.title,
          meta: formatDay(note.date),
          hook: note.summary,
        }))}
      />
    </div>
  );
}
