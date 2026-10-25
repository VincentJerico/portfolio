export interface StringAt {
  path: string;
  value: string;
}

/** Every string leaf in a value, with a readable path like `projects[2].findings[0].title`. */
export function collectStrings(value: unknown, path = ''): StringAt[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value))
    return value.flatMap((item, i) => collectStrings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      collectStrings(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

// Spec 12.2: placeholder markers and emojis must never reach rendered content.
export const BANNED: { rule: string; pattern: RegExp }[] = [
  { rule: 'TODO', pattern: /\bTODO\b/ },
  { rule: 'lorem', pattern: /lorem/i },
  { rule: 'CONFIRM', pattern: /\bCONFIRM\b/ },
  { rule: 'APPROVAL', pattern: /\bAPPROVAL\b/ },
  { rule: 'emoji', pattern: /\p{Extended_Pictographic}|\u{FE0F}|\u{20E3}|\p{Regional_Indicator}/u },
];

export function findBanned(value: unknown): { path: string; value: string; rule: string }[] {
  return collectStrings(value).flatMap(({ path, value: text }) =>
    BANNED.filter(({ pattern }) => pattern.test(text)).map(({ rule }) => ({
      path,
      value: text,
      rule,
    })),
  );
}

export function parseDenylist(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

export function findDenied(
  value: unknown,
  deny: readonly string[],
): { path: string; term: string }[] {
  const terms = deny.map((term) => ({ term, lower: term.toLowerCase() }));
  return collectStrings(value).flatMap(({ path, value: text }) => {
    const lower = text.toLowerCase();
    return terms.filter((t) => lower.includes(t.lower)).map(({ term }) => ({ path, term }));
  });
}

/** Format problems that would make a denylist silently match nothing (e.g. a mangled CI secret). */
export function denylistProblems(terms: readonly string[]): string[] {
  return terms.flatMap((term, i) => {
    const at = `term ${i + 1}`;
    if (term.includes(',')) return [`${at} contains a comma`];
    if (term.includes('\\n')) return [`${at} contains an escaped newline`];
    if (term.length > 60) return [`${at} is longer than 60 characters`];
    return [];
  });
}
