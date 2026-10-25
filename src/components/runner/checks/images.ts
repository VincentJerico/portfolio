import type { Check } from './types';
import { outsideRunner } from './types';

export const imagesCheck: Check = {
  name: 'Images',
  async run() {
    const images = [...document.querySelectorAll('img')].filter(outsideRunner);
    const missing = images.filter((img) => !img.hasAttribute('alt'));
    return {
      status: missing.length ? 'fail' : 'pass',
      details: missing.length
        ? missing.map((img) => `No alt attribute: ${img.getAttribute('src') ?? '(no src)'}`)
        : [`${images.length} image${images.length === 1 ? '' : 's'}, all with alt`],
    };
  },
};
