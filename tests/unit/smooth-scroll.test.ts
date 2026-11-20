import { describe, expect, it } from 'vitest';
import { LENIS_OPTIONS } from '@/components/motion/SmoothScroll';

describe('smooth scrolling', () => {
  // C53: a longer glide.
  it('glides with a lerp of 0.075', () => {
    expect(LENIS_OPTIONS.lerp).toBe(0.075);
  });

  it('lets tables and code blocks keep their own sideways scroll', () => {
    expect(LENIS_OPTIONS.allowNestedScroll).toBe(true);
  });
});
