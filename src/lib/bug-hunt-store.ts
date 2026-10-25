// Bug Hunt state, per browser. localStorage can throw (private modes, sandboxed frames), so memory
// keeps the hunt working for the visit. Activation also comes from ?bughunt=1 (and off from =0).
const ACTIVE_KEY = 'vj:bughunt';
const FOUND_KEY = 'vj:bughunt:found';

interface HuntState {
  active: boolean;
  found: readonly string[];
}

const SERVER_STATE: HuntState = { active: false, found: [] };
let state: HuntState | undefined;
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: memory still holds the state for this visit.
  }
}

function load(): HuntState {
  if (state) return state;
  const param = new URLSearchParams(window.location.search).get('bughunt');
  const active = param === '1' ? true : param === '0' ? false : read(ACTIVE_KEY) === '1';
  let found: string[] = [];
  try {
    const parsed: unknown = JSON.parse(read(FOUND_KEY) ?? '[]');
    if (Array.isArray(parsed)) found = parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    found = [];
  }
  state = { active, found };
  write(ACTIVE_KEY, active ? '1' : '0');
  return state;
}

function update(next: Partial<HuntState>) {
  state = { ...load(), ...next };
  write(ACTIVE_KEY, state.active ? '1' : '0');
  write(FOUND_KEY, JSON.stringify(state.found));
  listeners.forEach((listener) => listener());
}

export function setHuntActive(active: boolean) {
  update({ active });
  const url = new URL(window.location.href);
  if (url.searchParams.has('bughunt')) {
    url.searchParams.delete('bughunt');
    window.history.replaceState(null, '', url);
  }
}

export function markFound(id: string) {
  const current = load();
  if (!current.found.includes(id)) update({ found: [...current.found, id] });
}

export function subscribeHunt(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getHunt = (): HuntState => load();
export const getServerHunt = (): HuntState => SERVER_STATE;
