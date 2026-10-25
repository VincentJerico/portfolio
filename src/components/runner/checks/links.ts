import type { Check } from './types';
import { outsideRunner } from './types';

export const linksCheck: Check = {
  name: 'Links',
  async run(signal) {
    const anchors = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].filter(
      outsideRunner,
    );
    const internal = new Set<string>();
    const external = new Set<string>();
    for (const a of anchors) {
      const url = new URL(a.href, location.href);
      if (!url.protocol.startsWith('http')) continue;
      url.hash = '';
      (url.origin === location.origin ? internal : external).add(url.href);
    }
    const broken: string[] = [];
    await Promise.all(
      [...internal].map(async (href) => {
        const res = await fetch(href, { method: 'HEAD', signal });
        if (res.status >= 400) broken.push(`${res.status} ${new URL(href).pathname}`);
      }),
    );
    return {
      status: broken.length ? 'fail' : 'pass',
      details: [
        ...broken,
        `${internal.size} same-origin links checked; ${external.size} external links listed, not requested`,
      ],
    };
  },
};
