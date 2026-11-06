import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { visibleNotes } from '@/content/notes';
import { formatDay } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return visibleNotes().map(({ slug }) => ({ slug }));
}

function findNote(slug: string) {
  return visibleNotes().find((note) => note.slug === slug);
}

export async function generateMetadata({ params }: PageProps<'/notes/[slug]'>): Promise<Metadata> {
  const note = findNote((await params).slug);
  return note
    ? pageMetadata({ title: note.title, description: note.summary, path: `/notes/${note.slug}` })
    : {};
}

export default async function NotePage({ params }: PageProps<'/notes/[slug]'>) {
  const note = findNote((await params).slug);
  if (!note) notFound();
  const { default: Body } = await import(`@/content/notes/${note.slug}.mdx`);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <li>
              <Link href="/notes" className="inline-flex min-h-11 items-center">
                Notes
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page" className="text-ink">
                {note.title}
              </span>
            </li>
          </ol>
        </nav>
        <h1>{note.title}</h1>
        <p className="label-mono text-ink-muted">
          <time dateTime={note.date}>{formatDay(note.date)}</time>
        </p>
      </header>
      <div className="flex flex-col gap-4">
        <Body />
      </div>
    </article>
  );
}
