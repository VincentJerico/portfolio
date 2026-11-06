import type { ContactDeps } from './config';
import { MailError } from './mailer';
import {
  ContactInput,
  HONEYPOT_FIELD,
  fieldErrorsFrom,
  type ContactState,
  type ContactValues,
} from './schema';

function text(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

/** What the visitor typed, unchanged, so a refused or failed send can put it back in the form. */
export function valuesFrom(form: FormData): ContactValues {
  return { name: text(form, 'name'), email: text(form, 'email'), message: text(form, 'message') };
}

// A fixed classification only. Provider error messages can embed the request (the Redis key, the
// submission), so they are never logged.
function logFailure(kind: string): void {
  console.error('contact: delivery failed', kind);
}

export async function submitContact(
  form: FormData,
  clientKey: string,
  deps: ContactDeps,
): Promise<ContactState> {
  // Bots fill the hidden field; pretend success and spend nothing.
  if (text(form, HONEYPOT_FIELD).trim() !== '') return { status: 'sent' };

  const values = valuesFrom(form);
  const parsed = ContactInput.safeParse(values);
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  let allowed: boolean;
  try {
    allowed = await deps.limiter.limit(clientKey);
  } catch {
    logFailure('rate-limit');
    return { status: 'failed', values };
  }
  if (!allowed) return { status: 'rate-limited', values };

  try {
    await deps.mailer.send(parsed.data);
    return { status: 'sent' };
  } catch (err) {
    logFailure(err instanceof MailError ? `mail ${err.status}` : 'unknown');
    return { status: 'failed', values };
  }
}
