// Server-side only: the parsed CI report for this build.
import data from '@/generated/quality.json';
import { parseQuality } from './quality';

export const qualityReport = parseQuality(data);
