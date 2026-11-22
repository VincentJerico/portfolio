import { useId } from 'react';
import { ringText } from '@/lib/motion-text';

// A circle of radius 80 in a 200-unit box; the text is fitted to just under its circumference.
const RADIUS = 80;
const RING_PATH = `M100,100 m-${RADIUS},0 a${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`;
const RING_LENGTH = Math.round(2 * Math.PI * RADIUS * 0.99);

/**
 * The CV link as a ring of text (C52, move 5): the role and the place run round a filled centre that
 * reads "Download CV". The ring turns only while the page scrolls, never on its own. The text is
 * decoration (hidden from assistive tech); the link is named by its centre label.
 */
export function CvRing({ href, parts }: { href: string; parts: string[] }) {
  // Its own id, so two rings on one page never share a path (C54).
  const pathId = `cv-ring-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <a href={href} download className="cv-ring">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200">
        <defs>
          <path id={pathId} d={RING_PATH} />
        </defs>
        <text>
          <textPath href={`#${pathId}`} textLength={RING_LENGTH} lengthAdjust="spacing">
            {ringText(parts)}
          </textPath>
        </text>
      </svg>
      <span className="cv-ring-label">Download CV</span>
    </a>
  );
}
