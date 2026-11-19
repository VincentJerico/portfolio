import { ringText } from '@/lib/motion-text';

// A circle of radius 80 in a 200-unit box; the text is fitted to just under its circumference.
const RING_PATH = 'M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0';
const RING_LENGTH = 500;

/**
 * The CV link as a ring of text (C52, move 5): the role and the place run round a filled centre that
 * reads "Download CV". The ring turns only while the page scrolls, never on its own. The text is
 * decoration (hidden from assistive tech); the link is named by its centre label.
 */
export function CvRing({ href, parts }: { href: string; parts: string[] }) {
  return (
    <a href={href} download className="cv-ring">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200">
        <defs>
          <path id="cv-ring-path" d={RING_PATH} />
        </defs>
        <text>
          <textPath href="#cv-ring-path" textLength={RING_LENGTH} lengthAdjust="spacing">
            {ringText(parts)}
          </textPath>
        </text>
      </svg>
      <span className="cv-ring-label">Download CV</span>
    </a>
  );
}
