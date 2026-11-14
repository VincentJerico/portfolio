'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { plantedBugs } from '@/content/bug-hunt';
import { SeverityChip } from '@/components/ui/SeverityChip';

type Bug = (typeof plantedBugs)[number];

/** A planted bug's defect ticket. Loaded only when a player opens one, so visitors never pay for it. */
export default function HuntTicketDialog({ bug, onClose }: { bug: Bug; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    // Let the dialog's scale-out transition play before it unmounts.
    const onDialogClose = () => {
      Promise.all(dialog.getAnimations().map((animation) => animation.finished))
        .catch(() => {})
        .then(onClose);
    };
    dialog.addEventListener('close', onDialogClose);
    return () => dialog.removeEventListener('close', onDialogClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      data-print-hide
      aria-label={`${bug.id}: ${bug.title}`}
      className="m-auto w-[min(94vw,36rem)] max-w-none rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 py-2">
            <span className="font-mono text-sm font-medium">{bug.id}</span>
            <SeverityChip severity={bug.severity} />
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
          <p className="font-semibold">{bug.title}</p>
          <dl className="grid gap-x-5 gap-y-2.5 sm:grid-cols-[8.5rem_1fr]">
            <dt className="label-mono pt-0.5 text-ink-muted">Steps</dt>
            <dd>
              <ol className="list-decimal pl-5">
                {bug.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </dd>
            <dt className="label-mono pt-0.5 text-ink-muted">Expected</dt>
            <dd>{bug.expected}</dd>
            <dt className="label-mono pt-0.5 text-ink-muted">Actual</dt>
            <dd>{bug.actual}</dd>
            <dt className="label-mono pt-0.5 text-ink-muted">Caught by</dt>
            <dd>{bug.wouldBeCaughtBy}</dd>
          </dl>
        </div>
      </div>
    </dialog>
  );
}
