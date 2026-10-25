import { a11yCheck } from './a11y';
import { headersCheck } from './headers';
import { imagesCheck } from './images';
import { linksCheck } from './links';
import { performanceCheck } from './performance';
import { structureCheck } from './structure';
import type { Check } from './types';

export const CHECKS: Check[] = [
  a11yCheck,
  structureCheck,
  imagesCheck,
  linksCheck,
  headersCheck,
  performanceCheck,
];
export type { Check, CheckResult, CheckStatus } from './types';
