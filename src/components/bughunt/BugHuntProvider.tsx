'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { plantedBugs } from '@/content/bug-hunt';
import {
  getHunt,
  getServerHunt,
  markFound,
  setHuntActive,
  subscribeHunt,
} from '@/lib/bug-hunt-store';

type Bug = (typeof plantedBugs)[number];

const HuntTicketDialog = lazy(() => import('./HuntTicketDialog'));

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

  const closeTicket = useCallback(() => {
    setTicket(null);
    openerRef.current?.focus();
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
      {ticket && (
        <Suspense fallback={null}>
          <HuntTicketDialog bug={ticket} onClose={closeTicket} />
        </Suspense>
      )}
    </Context.Provider>
  );
}
