/** Date helpers on Luxon. Everything is UTC; the site stores ISO strings with milliseconds. */
import { DateTime } from 'luxon';

export const nowIso = () => new Date().toISOString();

/** `2026-09-01 21:27 UTC` */
export const formatUtc = (date: Date) => DateTime.fromJSDate(date, { zone: 'utc' }).toFormat("yyyy-LL-dd HH:mm 'UTC'");

/** `2026-09-01` in UTC, used for file names. */
export const utcDateStamp = (date: Date) => DateTime.fromJSDate(date, { zone: 'utc' }).toFormat('yyyy-LL-dd');

const SHORT_FORMATS = ['yyyy-LL-dd HH:mm', 'yyyy-LL-dd HH:mm:ss', "yyyy-LL-dd'T'HH:mm", "yyyy-LL-dd'T'HH:mm:ss"];

/**
 * Parses user input as a UTC date. Accepts a full ISO string (with `Z` or an
 * offset) or `YYYY-MM-DD HH:mm[:ss]`, read as UTC. Returns null when invalid.
 */
export const parseUtcInput = (input: string): Date | null => {
  const trimmed = input.trim();
  for (const format of SHORT_FORMATS) {
    const dt = DateTime.fromFormat(trimmed, format, { zone: 'utc' });
    if (dt.isValid) return dt.toJSDate();
  }
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/.test(trimmed)) return null;
  const dt = DateTime.fromISO(trimmed, { setZone: true });
  return dt.isValid ? dt.toUTC().toJSDate() : null;
};

/** Start of the next full hour, the default maintenance start. */
export const nextFullHour = (from = new Date()) =>
  DateTime.fromJSDate(from, { zone: 'utc' }).startOf('hour').plus({ hours: 1 }).toJSDate();

/** `3h ago`, `2d ago`, `in 5d` */
export const relativeAge = (date: Date, now = new Date()) => {
  const minutes = Math.round(DateTime.fromJSDate(now).diff(DateTime.fromJSDate(date), 'minutes').minutes);
  const abs = Math.abs(minutes);
  const text = abs < 60 ? `${abs}m` : abs < 60 * 48 ? `${Math.round(abs / 60)}h` : `${Math.round(abs / 1440)}d`;
  return minutes >= 0 ? `${text} ago` : `in ${text}`;
};
