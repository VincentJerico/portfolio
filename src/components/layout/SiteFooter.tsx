import Link from 'next/link';
import { profile } from '@/content';
import { MANILA_UTC_OFFSET_MINUTES } from '@/lib/clock';
import { footerNavItems } from '@/lib/nav-items';
import { LocalTime } from './LocalTime';

const LINK = 'inline-flex min-h-6 items-center text-ink no-underline hover:text-accent';

/** The footer on every page (C51): who this is, the pages that left the top bar, and how to reach Vincent. */
export function SiteFooter() {
  return (
    <footer data-site-footer data-print-hide className="mt-section border-t border-line">
      <div className="shell grid gap-8 py-10 font-mono text-[0.8125rem] sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-ink">{profile.fullName}</p>
          <p className="mt-1 text-ink-muted">{profile.headline}</p>
        </div>
        <nav aria-label="More pages">
          <ul className="flex flex-col gap-1">
            {footerNavItems().map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-col gap-1">
          <li>
            <a href={`mailto:${profile.email}`} className={`${LINK} break-all`}>
              {profile.email}
            </a>
          </li>
          <li>
            <a href={profile.github} className={LINK}>
              GitHub
            </a>
          </li>
          <li>
            <a href={profile.cvPdf} download className={LINK}>
              Download CV
            </a>
          </li>
        </ul>
        <div className="text-ink-muted">
          <p>{profile.location}</p>
          <LocalTime utcOffsetMinutes={MANILA_UTC_OFFSET_MINUTES} />
        </div>
      </div>
    </footer>
  );
}
