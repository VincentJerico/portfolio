import { radialLayout } from '@/lib/radial';

const BOX = { cx: 380, cy: 210, rx: 165, ry: 145 };

/**
 * The QA areas radiating from one node, drawn in as the section scrolls into view (globals.css).
 * Decorative: the numbered list beside it carries the same areas for screen readers and phones. All
 * areas have equal weight, because the data does not rank them.
 */
export function CoverageMap({ areas }: { areas: readonly string[] }) {
  const points = radialLayout(areas.length, BOX);
  return (
    <svg
      aria-hidden="true"
      className="cov-map mb-6 hidden w-full max-w-3xl md:block print:hidden"
      viewBox="0 0 760 420"
    >
      {areas.map((area, i) => {
        const point = points[i]!;
        const below = point.y > BOX.cy;
        return (
          <g key={area} className="cov-area" style={{ '--i': i } as React.CSSProperties}>
            <line
              className="cov-line"
              x1={BOX.cx}
              y1={BOX.cy}
              x2={point.x}
              y2={point.y}
              pathLength={1}
            />
            <text
              className="cov-label"
              x={point.x + (point.anchor === 'start' ? 10 : -10)}
              y={point.y + (below ? 14 : -4)}
              textAnchor={point.anchor}
            >
              {area}
            </text>
          </g>
        );
      })}
      <rect x={BOX.cx - 7} y={BOX.cy - 7} width={14} height={14} className="cov-node" />
      <text x={BOX.cx} y={BOX.cy + 30} textAnchor="middle" className="cov-label">
        vincent
      </text>
    </svg>
  );
}
