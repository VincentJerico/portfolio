'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, useSyncExternalStore, type ComponentType } from 'react';
import { closeRunner, getRunner, getServerRunner, subscribeRunner } from '@/lib/runner-store';

type Panel = ComponentType<{ path: string; onClose: () => void }>;

/** Renders the single runner panel for the page, loading it (and axe-core) on first use. */
export function RunnerHost() {
  const runner = useSyncExternalStore(subscribeRunner, getRunner, getServerRunner);
  const pathname = usePathname();
  const [Panel, setPanel] = useState<Panel | null>(null);

  useEffect(() => {
    if (runner.open && !Panel) {
      void import('./RunnerPanel').then((runnerModule) => setPanel(() => runnerModule.RunnerPanel));
    }
  }, [runner.open, Panel]);

  // Results describe the page they ran on; leaving that page closes them.
  useEffect(() => {
    if (runner.open && pathname !== runner.path) closeRunner();
  }, [pathname, runner.open, runner.path]);

  const close = useCallback(() => {
    const { opener } = getRunner();
    closeRunner();
    // A trigger inside the closed menu drawer is hidden; return focus to the menu button instead.
    const target = opener?.checkVisibility()
      ? opener
      : document.querySelector<HTMLElement>('[aria-controls="site-drawer"]');
    target?.focus();
  }, []);

  if (!runner.open) return null;
  return Panel ? (
    <Panel key={runner.run} path={runner.path} onClose={close} />
  ) : (
    <PanelPlaceholder />
  );
}

/** Holds the sheet's place while the runner's code downloads on first use. */
function PanelPlaceholder() {
  return (
    <div
      role="status"
      data-runner-loading
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-[min(100vw,44rem)] flex-col gap-3 rounded-t-card border border-b-0 border-line bg-surface px-4 pt-14 pb-6"
    >
      <span className="sr-only">Loading the test runner</span>
      {[60, 45, 70, 50].map((width) => (
        <span key={width} aria-hidden="true" className="flex items-center gap-3">
          <span className="skeleton h-6 w-[4.5rem]" />
          <span className="skeleton h-4" style={{ width: `${width}%` }} />
        </span>
      ))}
    </div>
  );
}
