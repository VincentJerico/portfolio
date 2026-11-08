/**
 * The wall-clock time at a fixed UTC offset, as "h:mm am". Plain arithmetic instead of
 * Intl.DateTimeFormat with a time zone: building that formatter loads the browser's zone data, which
 * cost about 20 ms of main-thread time on a throttled phone. A fixed offset suits zones without
 * daylight saving, such as Asia/Manila (UTC+8).
 */
export function clockAt(date: Date, utcOffsetMinutes: number): string {
  const local = new Date(date.getTime() + utcOffsetMinutes * 60_000);
  const hours = local.getUTCHours();
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
}

/** Asia/Manila is UTC+8 and has not observed daylight saving since 1990. */
export const MANILA_UTC_OFFSET_MINUTES = 8 * 60;
