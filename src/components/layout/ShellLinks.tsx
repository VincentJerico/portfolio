import { Mail } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { profile } from '@/content';

const linkClass =
  'flex min-h-11 items-center gap-3 rounded-chip px-2 text-sm text-ink no-underline hover:bg-surface-2';

export function ShellLinks() {
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
