import { z } from 'zod';
import { Note } from './schema';

// Notes are Vincent's own writing. Add a published note: see "Adding a note" in README.md.
// The selftest note is visible only in the CI test build (E2E_SELFTEST=1); until a note is
// published, /notes does not exist (decision C29).
const raw: z.input<typeof Note>[] = [
  {
    slug: 'selftest-pipeline',
    title: 'Notes pipeline self-test',
    summary: 'Proves the notes pipeline renders MDX in the CI test build.',
    date: '2026-11-05',
    status: 'selftest',
  },
];

// Parsed at import: an invalid entry throws, which fails `next build` and `pnpm test`.
export const notes: Note[] = z.array(Note).parse(raw);

/** Notes shown in this build, newest first. Drafts never show; selftest notes only in the test build. */
export function visibleNotes(selftest = process.env.E2E_SELFTEST === '1'): Note[] {
  return notes
    .filter((n) => n.status === 'published' || (selftest && n.status === 'selftest'))
    .toSorted((a, b) => b.date.localeCompare(a.date));
}
