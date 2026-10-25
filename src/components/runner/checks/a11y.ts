import type { Check } from './types';
import { RUNNER_SELECTOR } from './types';

// Spec 4.4 B.1: the same WCAG tags the CI gate uses.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export const a11yCheck: Check = {
  name: 'Accessibility',
  async run() {
    const { default: axe } = await import('axe-core');
    const results = await axe.run(
      { exclude: [RUNNER_SELECTOR] },
      { runOnly: { type: 'tag', values: TAGS }, resultTypes: ['violations'] },
    );
    return {
      status: results.violations.length === 0 ? 'pass' : 'fail',
      details: results.violations.map(
        (v) =>
          `${v.id} (${v.impact ?? 'unknown'}): ${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}`,
      ),
    };
  },
};
