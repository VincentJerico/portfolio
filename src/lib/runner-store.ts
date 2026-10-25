// One test run per page (spec 4.4 B): every "Run tests on this page" button drives this store, and a
// single host renders the panel, so two runs never overlap.
interface RunnerState {
  open: boolean;
  /** The page the run belongs to; the panel closes if the visitor navigates away. */
  path: string;
  /** Where focus returns when the panel closes. */
  opener: HTMLElement | null;
  /** Bumped on every open so a re-opened panel starts a fresh run. */
  run: number;
}

const CLOSED: RunnerState = { open: false, path: '', opener: null, run: 0 };
let state = CLOSED;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function openRunner(opener: HTMLElement) {
  if (state.open) {
    // Already running here: bring the existing panel to the visitor instead of starting another.
    document.querySelector<HTMLElement>('[data-runner-close]')?.focus();
    return;
  }
  state = { open: true, path: window.location.pathname, opener, run: state.run + 1 };
  emit();
}

export function closeRunner() {
  if (!state.open) return;
  state = { ...state, open: false };
  emit();
}

export function subscribeRunner(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getRunner = () => state;
export const getServerRunner = () => CLOSED;
