'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { StatusChip } from '@/components/ui/StatusChip';
import { CHECKS, type CheckResult } from './checks';

interface Row extends CheckResult {
  name: string;
  ms: number;
}

const LABEL = { pass: 'PASS', fail: 'FAIL', warn: 'WARN' } as const;

/** Runs the real checks against the current page and streams results like a test runner (spec 4.4 B). */
export function RunnerPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalMs, setTotalMs] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const panel = panelRef.current!;
    const controller = new AbortController();
    // Not a <dialog>: axe-core treats any visible open dialog as modal by an on-screen point test,
    // and then skips the rest of the page, so every scan would pass vacuously. A labelled region
    // keeps the page scannable. The runner self-tests pin this.
    panel.querySelector<HTMLElement>('[data-runner-close]')?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);

    (async () => {
      const started = performance.now();
      for (const check of CHECKS) {
        const t0 = performance.now();
        let result: CheckResult;
        try {
          result = await check.run(controller.signal);
        } catch (error) {
          if (controller.signal.aborted) return;
          result = {
            status: 'fail',
            details: [`Check could not run: ${(error as Error).message}`],
          };
        }
        if (controller.signal.aborted) return;
        setRows((previous) => [
          ...previous,
          { name: check.name, ms: performance.now() - t0, ...result },
        ]);
      }
      setTotalMs(performance.now() - started);
    })();

    return () => {
      controller.abort();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const passed = rows.filter((r) => r.status === 'pass').length;
  const failed = rows.filter((r) => r.status === 'fail').length;
  const done = totalMs !== null;
  const summary = done
    ? `${passed} passed, ${failed} failed in ${(totalMs / 1000).toFixed(1)}s`
    : '';

  return (
    <section
      ref={panelRef}
      data-runner-panel
      aria-label="Test run"
      className="fixed inset-x-0 bottom-0 z-40 m-0 mx-auto max-h-[75dvh] w-[min(100vw,44rem)] max-w-none overflow-hidden rounded-t-card border border-b-0 border-line bg-surface p-0 text-ink shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <p className="font-mono text-xs text-ink-muted">
          <span className="text-accent">$</span> run checks · {pathname}
        </p>
        <button
          type="button"
          data-runner-close
          onClick={onClose}
          aria-label="Close test run"
          className="inline-flex size-11 items-center justify-center rounded-chip hover:bg-surface-2"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="max-h-[calc(75dvh-3.5rem)] overflow-y-auto px-4 py-4 font-mono text-[0.8125rem]">
        <ol className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.name} data-check={row.name}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusChip status={row.status} label={LABEL[row.status]} />
                <span className="text-ink">{row.name}</span>
                <span className="ml-auto text-ink-muted">{Math.round(row.ms)} ms</span>
              </div>
              {row.details.length > 0 && (
                <ul className="mt-1.5 flex flex-col gap-0.5 pl-1 text-xs text-ink-muted">
                  {row.details.map((detail) => (
                    <li key={detail} className="break-words">
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {!done && (
            <li aria-hidden="true" className="flex items-center gap-3 text-ink-muted">
              <StatusChip status="running" />
              {CHECKS[rows.length]?.name}
            </li>
          )}
        </ol>
        <div className="mt-5 border-t border-line pt-4">
          <p role="status" aria-live="polite" className="text-sm font-medium text-ink">
            {summary}
          </p>
          {done && (
            <p className="mt-2 font-sans text-sm text-ink-muted">
              {failed === 0
                ? "The suite passed. There are still bugs a scanner can't see. Want to find them?"
                : 'Automated checks catch only part of what matters, and these failures are real ones to fix.'}{' '}
              <a href={`${pathname}?bughunt=1`} className="font-semibold">
                Try Bug Hunt
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
