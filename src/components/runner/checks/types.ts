export type CheckStatus = 'pass' | 'fail' | 'warn';

export interface CheckResult {
  status: CheckStatus;
  /** One line per notable item; empty when there is nothing to report. */
  details: string[];
}

export interface Check {
  name: string;
  run: (signal: AbortSignal) => Promise<CheckResult>;
}

/** Elements that belong to the runner itself are not part of the page under test. */
export const RUNNER_SELECTOR = '[data-runner-panel]';

export function outsideRunner(element: Element): boolean {
  return !element.closest(RUNNER_SELECTOR);
}
