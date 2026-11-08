import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { ButtonLink } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { ContactForm } from '@/components/contact/ContactForm';
import { isContactConfigured } from '@/lib/contact/config';
import { profile } from '@/content';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: profile.oneLiner,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-rhythm">
      <header className="measure">
        <p className="label-mono text-ink-muted">{profile.location}</p>
        <h1 className="mt-4">Contact</h1>
      </header>

      <section
        aria-labelledby="email-heading"
        className="rounded-card border border-line bg-surface p-6 lg:p-8"
      >
        <h2 id="email-heading" className="label-mono text-ink-muted">
          Email
        </h2>
        <p className="mt-3 font-mono text-lg break-all text-ink sm:text-xl">{profile.email}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink href={`mailto:${profile.email}`} variant="primary">
            <Mail aria-hidden="true" className="size-4" />
            Email me
          </ButtonLink>
          <CopyButton value={profile.email} label="Copy email" />
        </div>
      </section>

      {isContactConfigured() && (
        <section aria-labelledby="message-heading">
          <h2 id="message-heading" className="label-mono text-ink-muted">
            Send a message
          </h2>
          <p className="mt-3 mb-6 text-ink-muted">
            Messages go straight to my inbox; nothing is stored on this site.
          </p>
          <ContactForm email={profile.email} />
        </section>
      )}

      <section aria-labelledby="elsewhere-heading">
        <h2 id="elsewhere-heading" className="label-mono text-ink-muted">
          Elsewhere
        </h2>
        <ul className="mt-3 flex flex-col gap-1">
          <li>
            <a
              href={profile.github}
              className="inline-flex min-h-11 items-center gap-2 font-semibold"
            >
              <GitHubIcon className="size-4" />
              GitHub
            </a>
          </li>
          {profile.linkedin && (
            <li>
              <a
                href={profile.linkedin}
                className="inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                LinkedIn
              </a>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
