import { describe, expect, it } from 'vitest';
import { githubSlug } from '@/lib/slug';

describe('githubSlug (GitHub heading anchors)', () => {
  it('drops the middle dot and keeps the double hyphen it leaves behind', () => {
    expect(githubSlug('F-1 · Cart is not reachable by keyboard')).toBe(
      'f-1--cart-is-not-reachable-by-keyboard',
    );
  });

  it('drops colons and semicolons', () => {
    expect(githubSlug('OBS-001: Task CRUD is fast; capacity depends on the traffic mix')).toBe(
      'obs-001-task-crud-is-fast-capacity-depends-on-the-traffic-mix',
    );
  });

  it('drops em dashes and parentheses', () => {
    expect(githubSlug('Bug 2 — Broken access control (the important one)')).toBe(
      'bug-2--broken-access-control-the-important-one',
    );
  });
});
