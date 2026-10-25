export interface Step {
  href: string;
  label: string;
}

// P2: a guided path through the site, so no page is a dead end.
export function readingOrder({
  projects,
  caseStudies,
  hasClientWork,
}: {
  projects: Step[];
  caseStudies: Step[];
  hasClientWork: boolean;
}): Step[] {
  return [
    { href: '/', label: 'Overview' },
    { href: '/projects', label: 'Projects' },
    ...projects,
    ...(hasClientWork ? [{ href: '/work', label: 'Client Work' }, ...caseStudies] : []),
    { href: '/skills', label: 'Skills' },
    { href: '/about', label: 'About' },
    { href: '/resume', label: 'Resume' },
    { href: '/quality', label: 'Quality' },
    { href: '/contact', label: 'Contact' },
  ];
}

export function nextSpec(order: readonly Step[], pathname: string): Step | undefined {
  const index = order.findIndex((step) => step.href === pathname);
  return index === -1 ? order[0] : order[(index + 1) % order.length];
}
