// P1 exploration coverage: which pages this visitor has opened, per browser. localStorage can throw
// (private modes, sandboxed frames), so an in-memory set keeps it working for the visit.
const KEY = 'vj:coverage';
const EMPTY: readonly string[] = [];

let visited: readonly string[] | undefined;
const listeners = new Set<() => void>();

function load(): readonly string[] {
  if (visited) return visited;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    visited = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
  } catch {
    visited = [];
  }
  return visited;
}

export function markVisited(path: string) {
  const current = load();
  if (current.includes(path)) return;
  visited = [...current, path];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(visited));
  } catch {
    // Storage unavailable: the in-memory set still covers this visit.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCoverage(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getCoverage = (): readonly string[] => load();
export const getServerCoverage = (): readonly string[] => EMPTY;
