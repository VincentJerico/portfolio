import type { Check } from './types';

// Spec Section 10: the headers this site promises to send.
const REQUIRED = [
  'content-security-policy',
  'referrer-policy',
  'permissions-policy',
  'x-content-type-options',
  'x-frame-options',
  'strict-transport-security',
  'cross-origin-opener-policy',
];

export const headersCheck: Check = {
  name: 'Security headers',
  async run(signal) {
    const res = await fetch(location.href, { method: 'HEAD', cache: 'no-store', signal });
    const missing = REQUIRED.filter((name) => !res.headers.has(name));
    const cors = res.headers.get('access-control-allow-origin');
    const details = missing.map((name) => `Missing ${name}`);
    if (cors === '*') details.push('Access-Control-Allow-Origin: * is set');
    return {
      status: details.length ? 'fail' : 'pass',
      details: details.length ? details : [`All ${REQUIRED.length} required headers present`],
    };
  },
};
