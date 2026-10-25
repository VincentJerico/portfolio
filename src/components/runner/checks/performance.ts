import type { Check } from './types';

// Spec 12.5 budgets.
const LCP_BUDGET_MS = 2000;
const CLS_BUDGET = 0.05;

function buffered<T extends PerformanceEntry>(type: string): Promise<T[]> {
  return new Promise((resolve) => {
    try {
      const observer = new PerformanceObserver((list) => {
        observer.disconnect();
        resolve(list.getEntries() as T[]);
      });
      observer.observe({ type, buffered: true });
      // No entries of this type yet: resolve empty instead of waiting forever.
      setTimeout(() => {
        observer.disconnect();
        resolve([]);
      }, 300);
    } catch {
      resolve([]);
    }
  });
}

export const performanceCheck: Check = {
  name: 'Performance',
  async run() {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const lcpEntries = await buffered<PerformanceEntry & { startTime: number }>(
      'largest-contentful-paint',
    );
    const shifts = await buffered<PerformanceEntry & { value: number; hadRecentInput: boolean }>(
      'layout-shift',
    );
    const lcp = lcpEntries.at(-1)?.startTime;
    const cls = shifts.filter((s) => !s.hadRecentInput).reduce((sum, s) => sum + s.value, 0);

    const details: string[] = [];
    if (nav) {
      details.push(
        `TTFB ${Math.round(nav.responseStart)} ms · DOMContentLoaded ${Math.round(nav.domContentLoadedEventEnd)} ms · load ${Math.round(nav.loadEventEnd)} ms`,
      );
    }
    details.push(
      lcp === undefined
        ? 'LCP not measured (no paint entries)'
        : `LCP ${Math.round(lcp)} ms (budget ${LCP_BUDGET_MS} ms)`,
    );
    details.push(`CLS ${cls.toFixed(3)} (budget ${CLS_BUDGET})`);
    const overBudget = (lcp !== undefined && lcp > LCP_BUDGET_MS) || cls > CLS_BUDGET;
    return { status: overBudget ? 'fail' : 'pass', details };
  },
};
