'use client';

import { Check, LoaderCircle } from 'lucide-react';
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { sendContact } from '@/app/contact/actions';
import { Button } from '@/components/ui/Button';
import {
  blurError,
  finishEmail,
  maskEmail,
  FIELD_LIMITS,
  HONEYPOT_FIELD,
  type ContactField,
  type ContactState,
  type ContactValues,
} from '@/lib/contact/types';

const IDLE: ContactState = { status: 'idle' };
const EMPTY: ContactValues = { name: '', email: '', message: '' };
const FIELD_ORDER: ContactField[] = ['name', 'email', 'message'];
const MESSAGE_MAX = FIELD_LIMITS.message.max;

const CONTROL =
  'block min-h-11 w-full rounded-chip border border-line bg-surface px-3 py-2 text-ink transition-[border-color,box-shadow] duration-150 hover:border-ink-muted focus-visible:border-accent aria-[invalid=true]:border-fail';

type FieldControl = HTMLInputElement | HTMLTextAreaElement;

// Results render only while not pending, so each one is a fresh insertion that assistive tech announces.
// React resets the form after every submit, so each outcome but a send hands back what was typed.
// While pending the button stays focusable (aria-disabled, not disabled) so keyboard focus is not lost;
// extra submits are ignored instead.
// A field is checked when it loses focus with something typed in it, then on every keystroke until it
// is fixed; an untouched empty field is flagged only on submit. The server stays the authority.
export function ContactForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(sendContact, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  const [blurErrors, setBlurErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [messageLength, setMessageLength] = useState(0);

  const serverErrors = state.status === 'invalid' ? state.fieldErrors : {};
  const values = 'values' in state ? state.values : EMPTY;

  function ignoreWhilePending(event: FormEvent<HTMLFormElement>) {
    // A prevented submit does not run the form action.
    if (pending) event.preventDefault();
  }

  function check(control: FieldControl) {
    const field = control.name as ContactField;
    const typeMismatch = control instanceof HTMLInputElement && control.validity.typeMismatch;
    setBlurErrors((previous) => ({
      ...previous,
      [field]: blurError(field, control.value, typeMismatch),
    }));
  }

  function onBlur(event: FocusEvent<FieldControl>) {
    const control = event.target;
    if (control.name === 'email') control.value = finishEmail(control.value);
    if (control.value !== '') check(control);
  }

  function onInput(event: FormEvent<FieldControl>) {
    const control = event.currentTarget;
    if (control.name === 'email') {
      const masked = maskEmail(control.value);
      if (masked !== control.value) control.value = masked;
    }
    if (control.name === 'message') setMessageLength(control.value.length);
    if (blurErrors[control.name as ContactField]) check(control);
  }

  // A server result replaces the on-blur checks, and React resets the form to the values it hands back.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setBlurErrors({});
    setMessageLength(values.message.length);
  }

  useEffect(() => {
    if (state.status !== 'invalid') return;
    const first = FIELD_ORDER.find((field) => state.fieldErrors[field]);
    const target = first && formRef.current?.elements.namedItem(first);
    if (target instanceof HTMLElement) target.focus();
  }, [state]);

  const handlers = { onBlur, onInput };
  const errorFor = (field: ContactField) => blurErrors[field] ?? serverErrors[field];
  const nearLimit = messageLength > MESSAGE_MAX * 0.9;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={ignoreWhilePending}
      noValidate
      data-status={pending ? 'pending' : state.status}
      className="flex max-w-3xl flex-col gap-6"
    >
      <Field
        name="name"
        label="Name"
        hint="How I should address you."
        width="sm:max-w-sm"
        defaultValue={values.name}
        error={errorFor('name')}
        handlers={handlers}
        attrs={{
          autoComplete: 'name',
          autoCapitalize: 'words',
          spellCheck: false,
          enterKeyHint: 'next',
          maxLength: FIELD_LIMITS.name.max,
        }}
      />
      <Field
        name="email"
        label="Email"
        hint="Where my reply goes, like name@company.com."
        width="sm:max-w-md"
        defaultValue={values.email}
        error={errorFor('email')}
        handlers={handlers}
        attrs={{
          type: 'email',
          inputMode: 'email',
          autoComplete: 'email',
          autoCapitalize: 'none',
          spellCheck: false,
          enterKeyHint: 'next',
          maxLength: FIELD_LIMITS.email.max,
        }}
      />
      <Field
        name="message"
        label="Message"
        hint={`At least ${FIELD_LIMITS.message.min} characters. The role, team or project helps.`}
        multiline
        defaultValue={values.message}
        error={errorFor('message')}
        handlers={handlers}
        attrs={{ minLength: FIELD_LIMITS.message.min, maxLength: MESSAGE_MAX }}
        footer={
          <p
            aria-hidden="true"
            data-testid="message-count"
            className={`font-mono text-xs tabular-nums transition-colors duration-300 ${nearLimit ? 'text-warn' : 'text-ink-muted'}`}
          >
            {messageLength.toLocaleString('en-US')} / {MESSAGE_MAX.toLocaleString('en-US')}
          </p>
        }
      />

      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:pl-[calc(10rem+1.5rem)]">
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="primary" aria-disabled={pending || undefined}>
            {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {pending ? 'Sending…' : 'Send message'}
          </Button>
          <div role="status" className="text-sm text-ink">
            {!pending && state.status === 'sent' && (
              <p className="reveal-in inline-flex items-center gap-2">
                <Check aria-hidden="true" className="pop-in size-4 text-pass" />
                Message sent. I&apos;ll reply by email.
              </p>
            )}
          </div>
        </div>

        {!pending && state.status === 'invalid' && (
          <p role="alert" className="reveal-in text-sm font-semibold text-fail">
            Check the highlighted fields.
          </p>
        )}
        {!pending && state.status === 'rate-limited' && (
          <p role="alert" className="reveal-in text-sm font-semibold text-fail">
            Too many messages. Try again in a few minutes, or email me directly.
          </p>
        )}
        {!pending && state.status === 'failed' && (
          <p role="alert" className="reveal-in text-sm font-semibold text-fail">
            Your message could not be sent. Email me directly at{' '}
            <a href={`mailto:${email}`} className="break-all">
              {email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  name: ContactField;
  label: string;
  hint: string;
  /** Max width from 640px up, sized to what the field holds. Full width when omitted. */
  width?: string;
  defaultValue: string;
  error?: string;
  multiline?: boolean;
  attrs: InputHTMLAttributes<HTMLInputElement>;
  handlers: {
    onBlur: (event: FocusEvent<FieldControl>) => void;
    onInput: (event: FormEvent<FieldControl>) => void;
  };
  footer?: ReactNode;
}

// From 640px up the label and hint sit in a 10rem column beside the control; below that they stack.
function Field(props: FieldProps) {
  const {
    name,
    label,
    hint,
    width = '',
    defaultValue,
    error,
    multiline,
    attrs,
    handlers,
    footer,
  } = props;
  const id = `contact-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name,
    required: true,
    defaultValue,
    'aria-required': true as const,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${errorId} ${hintId}` : hintId,
    className: CONTROL,
    ...handlers,
  };
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]" data-field={name}>
      <div className="sm:pt-2.5">
        <label htmlFor={id} className="label-mono block text-ink">
          {label}
        </label>
        <p id={hintId} className="mt-1 text-sm leading-snug text-ink-muted">
          {hint}
        </p>
      </div>
      <div className={`min-w-0 ${width}`}>
        {multiline ? (
          <textarea rows={6} {...shared} minLength={attrs.minLength} maxLength={attrs.maxLength} />
        ) : (
          <input {...shared} {...attrs} />
        )}
        {(error || footer) && (
          <div className="mt-2 flex items-start justify-between gap-4">
            {error ? (
              <p id={errorId} className="reveal-in text-sm text-fail">
                {error}
              </p>
            ) : (
              <span />
            )}
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
