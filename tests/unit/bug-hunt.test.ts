import { describe, expect, it } from 'vitest';
import { plantedBugs } from '@/content';

describe('bug hunt content', () => {
  it('plants exactly five bugs', () => {
    expect(plantedBugs).toHaveLength(5);
  });

  it('spreads them across at least three routes', () => {
    expect(new Set(plantedBugs.map((b) => b.route)).size).toBeGreaterThanOrEqual(3);
  });

  it('never plants a bug on the resume', () => {
    expect(plantedBugs.some((b) => b.route === '/resume')).toBe(false);
  });

  it('gives each bug a unique id and target', () => {
    expect(new Set(plantedBugs.map((b) => b.id)).size).toBe(5);
    expect(new Set(plantedBugs.map((b) => b.targetId)).size).toBe(5);
  });
});
