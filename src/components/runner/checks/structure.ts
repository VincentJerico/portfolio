import type { Check } from './types';
import { outsideRunner } from './types';

export const structureCheck: Check = {
  name: 'Document structure',
  async run() {
    const problems: string[] = [];
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(outsideRunner);
    const h1s = headings.filter((h) => h.tagName === 'H1').length;
    if (h1s !== 1) problems.push(`${h1s} <h1> elements (expected exactly 1)`);
    headings.forEach((heading, i) => {
      const level = Number(heading.tagName[1]);
      const previous = i === 0 ? 0 : Number(headings[i - 1]!.tagName[1]);
      if (level > previous + 1) {
        problems.push(
          `h${previous || '–'} → h${level} skips a level: "${heading.textContent?.trim()}"`,
        );
      }
    });
    if (!document.querySelector('main')) problems.push('No <main> landmark');
    if (!document.documentElement.lang) problems.push('<html> has no lang attribute');
    return { status: problems.length ? 'fail' : 'pass', details: problems };
  },
};
