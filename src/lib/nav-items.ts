// Server-side only: reads parsed content. Client components receive the result as props.
import { approvedCaseStudies } from './content';
import { visibleNotes } from '@/content/notes';
import type { Note } from '@/content/schema';
import { FOOTER_NAV, NAV_ITEMS, PRIMARY_NAV, type NavItem } from './nav';

/** Drops Work when no case study is approved (spec 4.3) and Notes until a note is visible (C30). */
function available(items: readonly NavItem[], notes: readonly Note[]): NavItem[] {
  const hasClientWork = approvedCaseStudies().length > 0;
  return items.filter(
    (item) =>
      (item.href !== '/work' || hasClientWork) && (item.href !== '/notes' || notes.length > 0),
  );
}

/** Every top-level page this build has. */
export function navItems(notes: readonly Note[] = visibleNotes()): NavItem[] {
  return available(NAV_ITEMS, notes);
}

/** The top bar's links for this build. */
export function primaryNavItems(notes: readonly Note[] = visibleNotes()): NavItem[] {
  return available(PRIMARY_NAV, notes);
}

/** The footer's page links for this build. */
export function footerNavItems(notes: readonly Note[] = visibleNotes()): NavItem[] {
  return available(FOOTER_NAV, notes);
}
