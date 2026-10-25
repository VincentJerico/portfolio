'use client';

import { Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Image as EvidenceImage } from '@/content/schema';

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button, a[href]')].filter(
    (el) => el.getClientRects().length > 0,
  );
}

/** Evidence thumbnails; each opens full size in a native modal dialog (spec 7.3.10). */
export function EvidenceGallery({ images }: { images: readonly EvidenceImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();

    const onClose = () => {
      setOpenIndex(null);
      openerRef.current?.focus();
    };
    // A click on the dialog element itself (not its content) is a click on the backdrop.
    const onClick = (event: MouseEvent) => event.target === dialog && dialog.close();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables(dialog);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex]);

  const current = openIndex === null ? undefined : images[openIndex];

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {images.map((image, i) => (
          <li key={image.src} id={`evidence-${i}`} className="scroll-mt-20">
            <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-2">
              <button
                type="button"
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setOpenIndex(i);
                }}
                className="group relative flex min-h-24 items-center justify-center overflow-hidden rounded-[4px] bg-surface-2"
              >
                <span className="sr-only">Enlarge image: {image.caption ?? image.alt}</span>
                <Image
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="h-auto max-h-80 w-auto max-w-full object-contain"
                />
                <Maximize2
                  aria-hidden="true"
                  className="absolute top-2 right-2 size-7 rounded-chip bg-bg/80 p-1.5 text-ink opacity-80 group-hover:opacity-100"
                />
              </button>
              <figcaption className="px-1 pt-2 text-sm text-ink-muted">
                {image.caption ?? image.alt}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? `Evidence: ${current.caption ?? current.alt}` : 'Evidence'}
        className="m-auto max-h-[92dvh] w-[min(96vw,80rem)] max-w-none rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-black/80"
      >
        {current && (
          <figure className="flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-2">
              <figcaption className="py-2.5 text-sm text-ink-muted">
                {current.caption ?? current.alt}
              </figcaption>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close image"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-chip hover:bg-surface-2"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="overflow-auto p-4">
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="96vw"
                className="mx-auto h-auto max-w-full"
              />
            </div>
          </figure>
        )}
      </dialog>
    </>
  );
}
