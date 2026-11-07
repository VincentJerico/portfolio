import { describe, expect, it } from 'vitest';
import { radialLayout } from '../../src/lib/radial';

describe('radialLayout', () => {
  it('places 12 points on the ellipse, none straight above or below the centre', () => {
    const points = radialLayout(12, { cx: 380, cy: 210, rx: 165, ry: 145 });
    expect(points).toHaveLength(12);
    for (const point of points) {
      expect(((point.x - 380) / 165) ** 2 + ((point.y - 210) / 145) ** 2).toBeCloseTo(1, 5);
      expect(Math.abs(point.x - 380)).toBeGreaterThan(1);
    }
    expect(points[0]!.anchor).toBe('start');
  });

  it('anchors labels on the left half at their end', () => {
    const points = radialLayout(12, { cx: 380, cy: 210, rx: 165, ry: 145 });
    for (const point of points) {
      expect(point.anchor).toBe(point.x < 380 ? 'end' : 'start');
    }
  });
});
