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

  return runner.open && Panel ? (
    <Panel key={runner.run} path={runner.path} onClose={close} />
  ) : null;
}
