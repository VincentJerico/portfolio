'use client';

import { Play } from 'lucide-react';
import { useCallback, useRef, useState, type ComponentType } from 'react';

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
    triggerRef.current?.focus();
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
      {open && Panel && <Panel onClose={close} />}
    </>
  );
}
