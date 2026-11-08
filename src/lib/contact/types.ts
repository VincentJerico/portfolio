// Zod-free so the client form can import these without shipping the validator to the browser.

export const HONEYPOT_FIELD = 'website';

export type ContactField = 'name' | 'email' | 'message';
export type ContactValues = { name: string; email: string; message: string };

// Shared by the server schema and the form's on-blur checks, so both enforce and say the same thing.
export const FIELD_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 1, max: 254 },
  message: { min: 10, max: 5000 },
} as const satisfies Record<ContactField, { min: number; max: number }>;

export const FIELD_ERROR_COPY: Record<ContactField, { missing: string; tooLong: string }> = {
  name: { missing: 'Enter your name.', tooLong: 'Keep it under 100 characters.' },
  email: { missing: 'Enter a valid email address.', tooLong: 'Enter a valid email address.' },
  message: { missing: 'Write at least 10 characters.', tooLong: 'Keep it under 5,000 characters.' },
};

// Every outcome but a send carries what was submitted, so the form can put it back after React resets it.
export type ContactState =
  | { status: 'idle' }
  | {
      status: 'invalid';
      fieldErrors: Partial<Record<ContactField, string>>;
      values: ContactValues;
    }
  | { status: 'sent' }
  | { status: 'rate-limited'; values: ContactValues }
  | { status: 'failed'; values: ContactValues };

/**
 * The on-blur check for one field. `typeMismatch` is the browser's own email check; the server's zod
 * schema stays the authority on submit.
 */
export function blurError(
  field: ContactField,
  value: string,
  typeMismatch = false,
): string | undefined {
  const length = value.trim().length;
  const { min, max } = FIELD_LIMITS[field];
  if (length > max) return FIELD_ERROR_COPY[field].tooLong;
  if (length < min || typeMismatch) return FIELD_ERROR_COPY[field].missing;
  return undefined;
}

/** Email input mask: an address never contains whitespace, so typed or pasted spaces are dropped. */
export function maskEmail(value: string): string {
  return value.replace(/\s+/g, '');
}

/** On leaving the email field: domains are case-insensitive, so the part after the last @ is lowercased. */
export function finishEmail(value: string): string {
  const at = value.lastIndexOf('@');
  return at < 0 ? value : value.slice(0, at + 1) + value.slice(at + 1).toLowerCase();
}
