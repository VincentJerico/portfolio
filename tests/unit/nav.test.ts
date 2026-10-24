import { describe, expect, it } from 'vitest';
import { isActive, NAV_ITEMS } from '@/lib/nav';

describe('isActive', () => {
  it('matches the root path exactly', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/projects/x', '/')).toBe(false);
  });

  it('matches nested paths of a section', () => {
    expect(isActive('/projects/x', '/projects')).toBe(true);
    expect(isActive('/projects', '/projects')).toBe(true);
  });

  it('does not match a path that merely shares a prefix', () => {
    expect(isActive('/projectsx', '/projects')).toBe(false);
  });
});

describe('NAV_ITEMS', () => {
  it('lists the eight spec sections in order', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Overview',
      'Projects',
      'Client Work',
      'Skills',
      'About',
      'Resume',
      'Quality',
      'Contact',
    ]);
  });
});
