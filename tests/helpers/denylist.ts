import { existsSync, readFileSync } from 'node:fs';
import { parseDenylist } from '../../src/lib/strings';

// Private terms that must never be published: client names, regions, postal code, phone.
// Locally: tests/fixtures/client-denylist.txt (git-ignored). CI: the CLIENT_DENYLIST secret.
const FILE = 'tests/fixtures/client-denylist.txt';

export function loadDenylist(): string[] {
  const text = existsSync(FILE) ? readFileSync(FILE, 'utf8') : process.env.CLIENT_DENYLIST;
  if (!text?.trim()) {
    throw new Error(`client denylist missing: create ${FILE} or set CLIENT_DENYLIST`);
  }
  return parseDenylist(text);
}
