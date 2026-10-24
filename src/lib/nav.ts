export interface NavItem {
  href: string;
  label: string;
  /** Test-explorer "spec file" label, decorative (Phase 3b). */
  spec: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Overview', spec: 'overview.spec' },
  { href: '/projects', label: 'Projects', spec: 'projects/' },
  { href: '/work', label: 'Client Work', spec: 'work.spec' },
  { href: '/skills', label: 'Skills', spec: 'skills.spec' },
  { href: '/about', label: 'About', spec: 'about.spec' },
  { href: '/resume', label: 'Resume', spec: 'resume.spec' },
  { href: '/quality', label: 'Quality', spec: 'quality.spec' },
  { href: '/contact', label: 'Contact', spec: 'contact.spec' },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
