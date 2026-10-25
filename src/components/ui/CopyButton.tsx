'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

type State = 'idle' | 'copied' | 'failed';

const MESSAGES: Record<State, string> = {
  idle: '',
  copied: 'Copied to clipboard',
  failed: 'Copy failed — select the address instead',
};

/** Copies `value`; the result is shown next to the button and announced politely. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<State>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button onClick={copy}>
        {state === 'copied' ? (
          <Check aria-hidden="true" className="size-4 text-pass" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {label}
      </Button>
      <span role="status" aria-live="polite" className="text-sm text-ink-muted">
        {MESSAGES[state]}
      </span>
    </span>
  );
}
