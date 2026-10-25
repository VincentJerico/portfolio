// Server-side only: reads parsed content. Client components receive the result as props.
import { approvedCaseStudies } from './content';
import { NAV_ITEMS, type NavItem } from './nav';

/** Nav items for this build: Client Work is hidden when no case study is approved (spec 4.3). */
export function navItems(): NavItem[] {
  const hasClientWork = approvedCaseStudies().length > 0;
  return NAV_ITEMS.filter((item) => item.href !== '/work' || hasClientWork);
}
