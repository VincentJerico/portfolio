'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nextSpec, type Step } from '@/lib/next-spec';

/** "Next: …" at the end of every page (P2). Report pages already have prev/next, except the last. */
export function NextSpec({ order, reportsWithNext }: { order: Step[]; reportsWithNext: string[] }) {
  const pathname = usePathname();
  // Unknown paths are the 404 page, which already links back to Overview and Projects.
  if (reportsWithNext.includes(pathname) || !order.some((step) => step.href === pathname))
    return null;
  const next = nextSpec(order, pathname);
  if (!next) return null;

  return (
    <nav aria-label="Next page" data-print-hide className="mt-20 border-t border-line pt-8">
      <Link
        href={next.href}
        className="group flex min-h-11 items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 no-underline hover:border-accent/60"
      >
        <span className="flex flex-col gap-1">
          <span className="label-mono text-ink-muted">Next</span>
          <span className="text-lg font-semibold text-ink">{next.label}</span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-5 text-accent transition-transform group-hover:translate-x-1"
        />
      </Link>
    </nav>
  );
}
