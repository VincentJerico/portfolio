export interface RadialPoint {
  x: number;
  y: number;
  /** SVG text-anchor for a label at this point, so it reads outward from the centre. */
  anchor: 'start' | 'middle' | 'end';
}

/**
 * Evenly spaced points on an ellipse, clockwise from the top. Each angle is offset by half a step, so
 * no point sits straight above or below the centre, where labels would collide with their lines.
 */
export function radialLayout(
  count: number,
  box: { cx: number; cy: number; rx: number; ry: number },
): RadialPoint[] {
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + step / 2 + i * step;
    const x = box.cx + Math.cos(angle) * box.rx;
    const y = box.cy + Math.sin(angle) * box.ry;
    return { x, y, anchor: x > box.cx ? 'start' : 'end' };
  });
}
