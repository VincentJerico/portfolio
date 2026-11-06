// Zod-free so the client form can import these without shipping the validator to the browser.

export const HONEYPOT_FIELD = 'website';

export type ContactField = 'name' | 'email' | 'message';
export type ContactValues = { name: string; email: string; message: string };

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
