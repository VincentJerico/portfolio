'use client';

import { useActionState, useEffect, useRef } from 'react';
import { sendContact } from '@/app/contact/actions';
import { Button } from '@/components/ui/Button';
import {
  HONEYPOT_FIELD,
  type ContactField,
  type ContactState,
  type ContactValues,
} from '@/lib/contact/schema';

const IDLE: ContactState = { status: 'idle' };
const EMPTY: ContactValues = { name: '', email: '', message: '' };
const FIELD_ORDER: ContactField[] = ['name', 'email', 'message'];

const CONTROL =
  'mt-2 block min-h-11 w-full rounded-chip border border-line bg-surface px-3 py-2 text-ink aria-[invalid=true]:border-fail';

// Results render only while not pending, so each one is a fresh insertion that assistive tech announces.
export function ContactForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(sendContact, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};
  const values = state.status === 'invalid' ? state.values : EMPTY;

  useEffect(() => {
    if (state.status !== 'invalid') return;
    const first = FIELD_ORDER.find((field) => state.fieldErrors[field]);
    const target = first && formRef.current?.elements.namedItem(first);
    if (target instanceof HTMLElement) target.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex max-w-xl flex-col gap-5">
      <Field
        name="name"
        label="Name"
        autoComplete="name"
        maxLength={100}
        defaultValue={values.name}
        error={fieldErrors.name}
      />
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        maxLength={254}
        defaultValue={values.email}
        error={fieldErrors.email}
      />
      <Field
        name="message"
        label="Message"
        multiline
        maxLength={5000}
        defaultValue={values.message}
        error={fieldErrors.message}
      />

      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </Button>
        <div role="status" className="text-sm text-ink">
          {!pending && state.status === 'sent' && <p>Message sent. I&apos;ll reply by email.</p>}
        </div>
      </div>

      {!pending && state.status === 'invalid' && (
        <p role="alert" className="text-sm font-semibold text-fail">
          Check the highlighted fields.
        </p>
      )}
      {!pending && state.status === 'rate-limited' && (
        <p role="alert" className="text-sm font-semibold text-fail">
          Too many messages. Try again in a few minutes, or email me directly.
        </p>
      )}
      {!pending && state.status === 'failed' && (
        <p role="alert" className="text-sm font-semibold text-fail">
          Your message could not be sent. Email me directly at{' '}
          <a href={`mailto:${email}`} className="break-all">
            {email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

interface FieldProps {
  name: ContactField;
  label: string;
  type?: string;
  autoComplete?: string;
  maxLength: number;
  defaultValue: string;
  error?: string;
  multiline?: boolean;
}

function Field({ name, label, error, multiline, defaultValue, ...rest }: FieldProps) {
  const errorId = `contact-${name}-error`;
  const shared = {
    id: `contact-${name}`,
    name,
    required: true,
    defaultValue,
    'aria-required': true as const,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: CONTROL,
    ...rest,
  };
  return (
    <div>
      <label htmlFor={shared.id} className="label-mono text-ink-muted">
        {label}
      </label>
      {multiline ? <textarea rows={6} {...shared} /> : <input {...shared} />}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-fail">
          {error}
        </p>
      )}
    </div>
  );
}
