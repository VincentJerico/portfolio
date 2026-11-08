import { z } from 'zod';
import { FIELD_ERROR_COPY as COPY, FIELD_LIMITS, type ContactField } from './types';

export { HONEYPOT_FIELD, type ContactField, type ContactState, type ContactValues } from './types';

export const ContactInput = z.object({
  name: z.string().trim().min(FIELD_LIMITS.name.min).max(FIELD_LIMITS.name.max),
  email: z.email().max(FIELD_LIMITS.email.max),
  message: z.string().trim().min(FIELD_LIMITS.message.min).max(FIELD_LIMITS.message.max),
});

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
