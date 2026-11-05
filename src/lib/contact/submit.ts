import type { ContactDeps } from './config';
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

export async function submitContact(
  form: FormData,
  clientKey: string,
  deps: ContactDeps,
): Promise<ContactState> {
  // Bots fill the hidden field; pretend success and spend nothing.
  if (text(form, HONEYPOT_FIELD).trim() !== '') return { status: 'sent' };

  const values: ContactValues = {
    name: text(form, 'name'),
    email: text(form, 'email'),
    message: text(form, 'message'),
  };
  const parsed = ContactInput.safeParse(values);
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  try {
    if (!(await deps.limiter.limit(clientKey))) return { status: 'rate-limited' };
    await deps.mailer.send(parsed.data);
    return { status: 'sent' };
  } catch (err) {
    // Message only: never log the submission, addresses, IPs or secrets.
    console.error('contact: delivery failed', err instanceof Error ? err.message : 'unknown');
    return { status: 'failed' };
  }
}
