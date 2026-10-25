import type { Check, CheckResult } from './types';
import { RUNNER_SELECTOR } from './types';

// Spec 4.4 B.1: the same WCAG tags the CI gate uses.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// axe-core refuses to start while another scan runs; queue behind it instead of reporting a failure.
let previous: Promise<unknown> = Promise.resolve();

const NOT_MEASURED: CheckResult = {
  status: 'warn',
  details: [
    'Not measured: a dialog was open during the scan, which hides the page from axe. Close it and run again.',
  ],
};

export const a11yCheck: Check = {
  name: 'Accessibility',
  async run(signal) {
    const { default: axe } = await import('axe-core');
    const scan = previous.then(() =>
      axe.run(
        { exclude: [RUNNER_SELECTOR] },
        { runOnly: { type: 'tag', values: TAGS }, resultTypes: ['violations'] },
      ),
    );
    previous = scan.catch(() => undefined);
    const modalAtStart = document.querySelector(':modal');
    const results = await scan;
    signal.throwIfAborted();
    // A modal makes the rest of the page inert and axe skips it: a pass would be vacuous.
    if (modalAtStart || document.querySelector(':modal')) return NOT_MEASURED;
    return {
      status: results.violations.length === 0 ? 'pass' : 'fail',
      details: results.violations.map(
        (v) =>
          `${v.id} (${v.impact ?? 'unknown'}): ${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}`,
      ),
    };
  },
};
