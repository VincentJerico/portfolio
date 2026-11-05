// Server-side only: reads parsed content. Client components receive the result as props.
import { approvedCaseStudies } from './content';
import { visibleNotes } from '@/content/notes';
import type { Note } from '@/content/schema';
import { NAV_ITEMS, type NavItem } from './nav';

/**
 * Nav items for this build: Client Work is hidden when no case study is approved (spec 4.3),
 * and Notes until the first note is visible (decision C29).
 */
export function navItems(notes: readonly Note[] = visibleNotes()): NavItem[] {
  const hasClientWork = approvedCaseStudies().length > 0;
  return NAV_ITEMS.filter(
    (item) =>
      (item.href !== '/work' || hasClientWork) && (item.href !== '/notes' || notes.length > 0),
  );
}
