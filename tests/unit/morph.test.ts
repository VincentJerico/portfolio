import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { morph, MORPH_WATCHDOG_MS } from '../../src/lib/morph';

// A browser whose view transition never gets round to its update (WebKit on CI did this): the
// dialog must still open, without the animation.
function stubBrowser(callsUpdate: boolean) {
  const skip = vi.fn();
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  vi.stubGlobal('document', {
    startViewTransition: ({ update }: { update: () => void }) => {
      if (callsUpdate) queueMicrotask(update);
      return { finished: new Promise(() => {}), skipTransition: skip };
    },
  });
  return { skip };
}
const element = () => ({ style: { viewTransitionName: '' } }) as unknown as HTMLElement;

describe('morph', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('runs the update itself when the transition stalls, and skips the animation', () => {
    const { skip } = stubBrowser(false);
    const update = vi.fn(() => null);
    morph(element(), update);
    expect(update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MORPH_WATCHDOG_MS);
    expect(update).toHaveBeenCalledTimes(1);
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('runs the update once when the transition does its job', async () => {
    const { skip } = stubBrowser(true);
    const update = vi.fn(() => null);
    morph(element(), update);
    await Promise.resolve();
    vi.advanceTimersByTime(MORPH_WATCHDOG_MS * 2);
    expect(update).toHaveBeenCalledTimes(1);
    expect(skip).not.toHaveBeenCalled();
  });
});
