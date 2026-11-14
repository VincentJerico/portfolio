'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [attempt, setAttempt] = useState(0);

  // The result clears after a few seconds, so the button is ready to copy again.
  useEffect(() => {
    if (state === 'idle') return;
    const id = window.setTimeout(() => setState('idle'), 3000);
    return () => window.clearTimeout(id);
  }, [state, attempt]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    setAttempt((n) => n + 1);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button onClick={copy}>
        {state === 'copied' ? (
          <Check key={attempt} aria-hidden="true" className="pop-in size-4 text-pass" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {label}
      </Button>
      <span role="status" aria-live="polite" className="text-sm text-ink-muted">
        {state !== 'idle' && (
          <span key={attempt} className="reveal-in inline-block">
            {MESSAGES[state]}
          </span>
        )}
      </span>
    </span>
  );
}
