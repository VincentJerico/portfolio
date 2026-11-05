import { z } from 'zod';

export const HONEYPOT_FIELD = 'website';

export const ContactInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export type ContactField = 'name' | 'email' | 'message';
export type ContactValues = { name: string; email: string; message: string };

export type ContactState =
  | { status: 'idle' }
  | {
      status: 'invalid';
      fieldErrors: Partial<Record<ContactField, string>>;
      values: ContactValues;
    }
  | { status: 'sent' }
  | { status: 'rate-limited' }
  | { status: 'failed' };

const COPY: Record<ContactField, { missing: string; tooLong: string }> = {
  name: { missing: 'Enter your name.', tooLong: 'Keep it under 100 characters.' },
  email: { missing: 'Enter a valid email address.', tooLong: 'Enter a valid email address.' },
  message: { missing: 'Write at least 10 characters.', tooLong: 'Keep it under 5,000 characters.' },
};

export function fieldErrorsFrom(error: z.ZodError): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field !== 'name' && field !== 'email' && field !== 'message') continue;
    if (errors[field]) continue;
    errors[field] = issue.code === 'too_big' ? COPY[field].tooLong : COPY[field].missing;
  }
  return errors;
}
