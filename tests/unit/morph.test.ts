import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { morph, MORPH_WATCHDOG_MS } from '../../src/lib/morph';

// A browser whose view transition never gets round to its update (WebKit on CI did this): the
// dialog must still open, without the animation.
function stubBrowser(callsUpdate: boolean) {
  const skip = vi.fn();
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  vi.stubGlobal('document', {
    startViewTransition: ({ update }: { update: () => void }) => {
      // Like the browser: a throwing update rejects updateCallbackDone, and nothing else hears it.
      const updateCallbackDone = callsUpdate
        ? Promise.resolve().then(update)
        : new Promise<void>(() => {});
      updateCallbackDone.catch(() => {});
      return { finished: new Promise(() => {}), updateCallbackDone, skipTransition: skip };
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

  it('reports an update that throws instead of swallowing it', async () => {
    stubBrowser(true);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    morph(element(), () => {
      throw new Error('showModal failed');
    });
    await vi.runAllTimersAsync();
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: 'showModal failed' }));
  });
});
