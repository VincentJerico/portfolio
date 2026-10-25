import type { Project } from '@/content/schema';

// Month names are spelled out so output never depends on the build machine's locale.
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function parts(value: string): { year: string; month?: number; day?: number } {
  const [year, month, day] = value.split('-');
  return {
    year: year!,
    month: month ? Number(month) - 1 : undefined,
    day: day ? Number(day) : undefined,
  };
}

const longMonth = (month: number) => MONTHS[month]!;
const shortMonth = (month: number) => MONTHS[month]!.slice(0, 3);

/** '2026-08' → 'August 2026' */
export function formatMonth(value: string): string {
  const { year, month } = parts(value);
  return month === undefined ? year : `${longMonth(month)} ${year}`;
}

/** '2025-01' → 'Jan 2025'; '2026' → '2026' */
export function formatShortMonth(value: string): string {
  const { year, month } = parts(value);
  return month === undefined ? year : `${shortMonth(month)} ${year}`;
}

/** '2026-09-03' → '3 Sep 2026' */
export function formatDay(value: string): string {
  const { year, month, day } = parts(value);
  if (day === undefined || month === undefined) return formatShortMonth(value);
  return `${day} ${shortMonth(month)} ${year}`;
}

/** Any of: '2026', '2026-07', '2026-09-03'. */
function formatAny(value: string): string {
  return parts(value).day === undefined ? formatShortMonth(value) : formatDay(value);
}

/** Experience dates: open end reads "Present". */
export function formatPeriod(start: string, end?: string): string {
  return `${formatAny(start)} – ${end ? formatAny(end) : 'Present'}`;
}

/** Timeline cells: '2025-01 to 2025-11', '2026', '2026-09-04' or 'Next'. */
export function formatTimelineDate(value: string): string {
  if (!/^\d{4}/.test(value)) return value;
  const [from, to] = value.split(' to ');
  return to ? `${formatAny(from!)} – ${formatAny(to)}` : formatAny(from!);
}

/** Certification dates: '2025-01/2025-04' → 'Jan – Apr 2025'. */
export function formatCertDate(value: string): string {
  const [from, to] = value.split('/');
  if (!to) return formatShortMonth(from!);
  const a = parts(from!);
  const b = parts(to);
  if (a.year === b.year && a.month !== undefined && b.month !== undefined) {
    return `${shortMonth(a.month)} – ${shortMonth(b.month)} ${a.year}`;
  }
  return `${formatShortMonth(from!)} – ${formatShortMonth(to)}`;
}

/** First-to-latest commit range of a project, or its year. */
export function formatProjectPeriod(project: Pick<Project, 'startDate' | 'endDate' | 'year'>) {
  const { startDate, endDate, year } = project;
  if (!startDate) return year;
  if (!endDate || endDate === startDate) return formatDay(startDate);
  const a = parts(startDate);
  const b = parts(endDate);
  const startText = a.year === b.year ? `${a.day} ${shortMonth(a.month!)}` : formatDay(startDate);
  return `${startText} – ${formatDay(endDate)}`;
}

/** Splits `code` spans out of content text so they render as <code>, not literal backticks. */
export function splitInlineCode(text: string): { code: boolean; text: string }[] {
  return text
    .split(/(`[^`]+`)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`')
        ? { code: true, text: part.slice(1, -1) }
        : { code: false, text: part },
    );
}
