import { radialLayout } from '@/lib/radial';

const BOX = { cx: 400, cy: 230, rx: 200, ry: 165 };
const HUB = 30;
const RINGS = [0.36, 0.68, 1];

/**
 * The QA areas radiating from one hub, like a coverage scope. As the section scrolls into view the
 * rings open out, each line draws from the hub, its end node lands and its label rises (globals.css).
 * Decorative: the numbered list beside it carries the same areas for screen readers and phones. All
 * areas have equal weight, because the data does not rank them.
 */
export function CoverageMap({ areas }: { areas: readonly string[] }) {
  const points = radialLayout(areas.length, BOX);
  return (
    <svg
      aria-hidden="true"
      className="cov-map mx-auto mb-6 hidden w-full max-w-4xl md:block print:hidden"
      viewBox="0 0 800 460"
    >
      {RINGS.map((scale) => (
        <ellipse
          key={scale}
          className="cov-ring"
          cx={BOX.cx}
          cy={BOX.cy}
          rx={BOX.rx * scale}
          ry={BOX.ry * scale}
        />
      ))}
      {areas.map((area, i) => {
        const point = points[i]!;
        const dx = point.x - BOX.cx;
        const dy = point.y - BOX.cy;
        const toEdge = HUB / Math.hypot(dx, dy);
        const below = point.y > BOX.cy;
        return (
          <g key={area} className="cov-area" style={{ '--i': i } as React.CSSProperties}>
            <line
              className="cov-line"
              x1={BOX.cx + dx * toEdge}
              y1={BOX.cy + dy * toEdge}
              x2={point.x}
              y2={point.y}
              pathLength={1}
            />
            <circle className="cov-end" cx={point.x} cy={point.y} r={3.5} />
            <text
              className="cov-label"
              x={point.x + (point.anchor === 'start' ? 12 : -12)}
              y={point.y + (below ? 15 : -6)}
              textAnchor={point.anchor}
            >
              <tspan className="cov-num">{String(i + 1).padStart(2, '0')} </tspan>
              {area}
            </text>
          </g>
        );
      })}
      <circle className="cov-hub" cx={BOX.cx} cy={BOX.cy} r={HUB} />
      <text x={BOX.cx} y={BOX.cy + 4} textAnchor="middle" className="cov-label cov-hub-label">
        vincent
      </text>
    </svg>
  );
}
