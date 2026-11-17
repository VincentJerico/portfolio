import { Mail } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { profile } from '@/content';

const linkClass =
  'flex min-h-11 items-center gap-3 rounded-chip px-2 text-sm text-ink no-underline hover:bg-surface-2';

const barClass =
  'flex min-h-11 items-center gap-1.5 rounded-chip px-2 text-[0.6875rem] text-ink-muted no-underline hover:bg-surface-2 hover:text-ink';

export function ShellLinks({ bar = false }: { bar?: boolean }) {
  const item = bar ? barClass : linkClass;
  return (
    <ul className={bar ? 'flex items-center' : 'flex flex-col gap-0.5'}>
      <li>
        <a href={profile.github} className={item}>
          <GitHubIcon className={bar ? 'size-3.5' : 'size-4 text-ink-muted'} />
          GitHub
        </a>
      </li>
      <li>
        <a href={`mailto:${profile.email}`} className={item}>
          <Mail aria-hidden="true" className={bar ? 'size-3.5' : 'size-4 text-ink-muted'} />
          Email
        </a>
      </li>
    </ul>
  );
}
