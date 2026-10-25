'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { plantedBugs } from '@/content/bug-hunt';
import { SeverityChip } from '@/components/ui/SeverityChip';
import {
  getHunt,
  getServerHunt,
  markFound,
  setHuntActive,
  subscribeHunt,
} from '@/lib/bug-hunt-store';

type Bug = (typeof plantedBugs)[number];

interface HuntContext {
  /** True only while hunting on a page where the hunt may run (never /resume). */
  active: boolean;
  enabled: boolean;
  found: readonly string[];
  bugs: readonly Bug[];
  isPlanted: (id: string) => boolean;
  inspect: (id: string, opener: HTMLElement) => void;
  setEnabled: (on: boolean) => void;
}

const Context = createContext<HuntContext | null>(null);

export function useBugHunt(): HuntContext {
  const value = useContext(Context);
  if (!value) throw new Error('useBugHunt must be used inside <BugHuntProvider>');
  return value;
}

/** Bug Hunt mode (spec 4.4 C): state, the "No defect here." announcer and the defect ticket dialog. */
export function BugHuntProvider({ children }: { children: ReactNode }) {
  const hunt = useSyncExternalStore(subscribeHunt, getHunt, getServerHunt);
  const pathname = usePathname();
  const active = hunt.active && pathname !== '/resume';
  const [ticket, setTicket] = useState<Bug | null>(null);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const inspect = useCallback((id: string, opener: HTMLElement) => {
    const bug = plantedBugs.find((b) => b.targetId === id);
    openerRef.current = opener;
    if (bug) {
      markFound(bug.id);
      setMessage('');
      setTicket(bug);
    } else {
      // Clear first so an identical message is announced again.
      setMessage('');
      requestAnimationFrame(() => setMessage('No defect here.'));
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (ticket && dialog && !dialog.open) dialog.showModal();
  }, [ticket]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setTicket(null);
      openerRef.current?.focus();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  const value = useMemo<HuntContext>(
    () => ({
      active,
      enabled: hunt.active,
      found: hunt.found,
      bugs: plantedBugs,
      isPlanted: (id) => plantedBugs.some((b) => b.targetId === id),
      inspect,
      setEnabled: setHuntActive,
    }),
    [active, hunt.active, hunt.found, inspect],
  );

  return (
    <Context.Provider value={value}>
      {children}
      {active && (
        <p role="status" aria-live="polite" className="sr-only" data-print-hide>
          {message}
        </p>
      )}
      {active && message && (
        <p
          aria-hidden="true"
          data-print-hide
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-chip border border-line bg-surface px-3 py-2 font-mono text-xs text-ink shadow-lg"
        >
          {message}
        </p>
      )}
      <dialog
        ref={dialogRef}
        data-print-hide
        aria-label={ticket ? `${ticket.id}: ${ticket.title}` : 'Defect ticket'}
        className="m-auto w-[min(94vw,36rem)] max-w-none rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
      >
        {ticket && (
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
              <div className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-mono text-sm font-medium">{ticket.id}</span>
                <SeverityChip severity={ticket.severity} />
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close ticket"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-chip hover:bg-surface-2"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4 text-[0.9375rem]">
              <p className="font-semibold">{ticket.title}</p>
              <dl className="grid gap-x-5 gap-y-2.5 sm:grid-cols-[8.5rem_1fr]">
                <dt className="label-mono pt-0.5 text-ink-muted">Steps</dt>
                <dd>
                  <ol className="list-decimal pl-5">
                    {ticket.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </dd>
                <dt className="label-mono pt-0.5 text-ink-muted">Expected</dt>
                <dd>{ticket.expected}</dd>
                <dt className="label-mono pt-0.5 text-ink-muted">Actual</dt>
                <dd>{ticket.actual}</dd>
                <dt className="label-mono pt-0.5 text-ink-muted">Caught by</dt>
                <dd>{ticket.wouldBeCaughtBy}</dd>
              </dl>
            </div>
          </div>
        )}
      </dialog>
    </Context.Provider>
  );
}
