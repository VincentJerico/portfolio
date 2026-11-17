import { Mail } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { profile } from '@/content';

const linkClass =
  'flex min-h-11 items-center gap-3 rounded-chip px-2 text-sm text-ink no-underline hover:bg-surface-2';

const barClass =
  'tip flex size-11 items-center justify-center rounded-chip text-ink-muted no-underline hover:bg-surface-2 hover:text-ink';

export function ShellLinks({ bar = false }: { bar?: boolean }) {
  if (bar) {
    return (
      <ul className="flex items-center">
        <li>
          <a href={profile.github} data-tip="GitHub" className={barClass}>
            <GitHubIcon className="size-4" />
            <span className="sr-only">GitHub</span>
          </a>
        </li>
        <li>
          <a href={`mailto:${profile.email}`} data-tip="Email" className={barClass}>
            <Mail aria-hidden="true" className="size-4" />
            <span className="sr-only">Email</span>
          </a>
        </li>
      </ul>
    );
  }
  return (
    <ul className="flex flex-col gap-0.5">
      <li>
        <a href={profile.github} className={linkClass}>
          <GitHubIcon className="size-4 text-ink-muted" />
          GitHub
        </a>
      </li>
      <li>
        <a href={`mailto:${profile.email}`} className={linkClass}>
          <Mail aria-hidden="true" className="size-4 text-ink-muted" />
          Email
        </a>
      </li>
    </ul>
  );
}
