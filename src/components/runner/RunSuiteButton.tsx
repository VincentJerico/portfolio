'use client';

import { Play } from 'lucide-react';
import { useCallback, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';

type Panel = ComponentType<{ onClose: () => void }>;

/** Loads the runner (and axe-core) only when pressed, so neither counts against initial JS. */
export function RunSuiteButton({ className = '' }: { className?: string }) {
  const [Panel, setPanel] = useState<Panel | null>(null);
  const [open, setOpen] = useState(false);
  const loading = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  async function start() {
    if (open || loading.current) return;
    loading.current = true;
    // A modal (the mobile menu drawer) would make the page inert, and axe skips inert content.
    document
      .querySelectorAll('dialog')
      .forEach((dialog) => dialog.matches(':modal') && dialog.close());
    try {
      const runner = await import('./RunnerPanel');
      setPanel(() => runner.RunnerPanel);
      setOpen(true);
    } finally {
      loading.current = false;
    }
  }

  const close = useCallback(() => {
    setOpen(false);
    // A trigger inside the now-closed drawer is hidden; return focus to the menu button instead.
    const trigger = triggerRef.current;
    const target = trigger?.checkVisibility()
      ? trigger
      : document.querySelector<HTMLElement>('[aria-controls="site-drawer"]');
    target?.focus();
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={start}
        className={`inline-flex min-h-11 items-center gap-2 rounded-chip px-2.5 text-sm font-medium text-accent hover:bg-surface-2 ${className}`}
      >
        <Play aria-hidden="true" className="size-4" />
        Run tests on this page
      </button>
      {open && Panel && createPortal(<Panel onClose={close} />, document.body)}
    </>
  );
}
