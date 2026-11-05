export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface Mailer {
  send(msg: ContactMessage): Promise<void>;
}

/** A refusal from the mail provider. Carries the HTTP status only, never the response body. */
export class MailError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Mail provider responded ${status}`);
    this.status = status;
    this.name = 'MailError';
  }
}

const SEND_TIMEOUT_MS = 10_000;

export function resendMailer(apiKey: string, to: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send({ name, email, message }) {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio contact <onboarding@resend.dev>',
          to,
          reply_to: email,
          subject: `Portfolio contact from ${name}`,
          text: `From: ${name} <${email}>\n\n${message}\n`,
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      if (!response.ok) throw new MailError(response.status);
    },
  };
}

// Stand-in for the CI test build: delivers nothing, and fails on demand.
export function testMailer(): Mailer {
  return {
    async send({ message }) {
      if (message.includes('e2e-mailer-failure')) throw new Error('Simulated mail failure');
    },
  };
}
