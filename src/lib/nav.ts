export interface NavItem {
  href: string;
  label: string;
}

/** The top bar (C51): the main pages. Work hides until a case study is approved (spec 4.3). */
export const PRIMARY_NAV: readonly NavItem[] = [
  { href: '/projects', label: 'Projects' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
];

/** The footer (C51): the pages that left the top bar. Notes hides until a note is visible (C30). */
export const FOOTER_NAV: readonly NavItem[] = [
  { href: '/skills', label: 'Skills' },
  { href: '/notes', label: 'Notes' },
  { href: '/quality', label: 'Quality' },
];

/** Every top-level page, for the sitemap and the route checks. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  ...PRIMARY_NAV,
  ...FOOTER_NAV,
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
