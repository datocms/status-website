/**
 * Every date and time that the site shows is in UTC. These functions read
 * only the UTC fields of a date, so the result does not depend on the time
 * zone of the machine that builds the page, or of the browser.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (value: number) => String(value).padStart(2, '0');

/** `2026-09-28` */
export const utcDayStamp = (date: Date) => date.toISOString().slice(0, 10);

/** `2026-09` */
export const utcMonthStamp = (date: Date) => date.toISOString().slice(0, 7);

/** `September 28, 2026` */
export const utcDate = (date: Date) =>
  `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;

/** `September 2026` */
export const utcMonth = (date: Date) =>
  `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

/** `Sep 28` */
export const utcShortDate = (date: Date) =>
  `${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCDate()}`;

/** `06:30` */
export const utcClock = (date: Date) =>
  `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;

/** `Sep 28, 06:30 UTC` */
export const utcTimestamp = (date: Date) =>
  `${utcShortDate(date)}, ${utcClock(date)} UTC`;

/** `Monday, Sep 28, 06:30 UTC` */
export const utcWeekdayTimestamp = (date: Date) =>
  `${WEEKDAYS[date.getUTCDay()]}, ${utcTimestamp(date)}`;

export const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const startOfUtcMonth = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

export const isSameUtcDay = (a: Date, b: Date) => utcDayStamp(a) === utcDayStamp(b);

export const isSameUtcMonth = (a: Date, b: Date) => utcMonthStamp(a) === utcMonthStamp(b);

export const subUtcDays = (date: Date, days: number) =>
  new Date(date.getTime() - days * 86_400_000);

/** For the first day of a month: the first day of an earlier month. */
export const subUtcMonths = (date: Date, months: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate()));

/** Full months from one date to a later one. */
export const monthsBetween = (from: Date, to: Date) =>
  (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
  to.getUTCMonth() -
  from.getUTCMonth() -
  (to.getUTCDate() < from.getUTCDate() ? 1 : 0);

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Reads a stored date. A date without a zone is UTC: JavaScript reads such a
 * text in the zone of the machine, and the page would then differ from one
 * build machine to the next.
 */
export const parseInstant = (text: string): Date => {
  const value = text.trim();

  if (HAS_ZONE.test(value)) return new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00Z`);

  return new Date(`${value.replace(' ', 'T')}Z`);
};

const UNITS: [unit: Intl.RelativeTimeFormatUnit, seconds: number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

/**
 * `3 hr. ago`, `in 3 days`. It counts full units: 119 seconds are 1 minute.
 * The browser has the words, so this needs no library.
 */
export const relativeTime = (date: Date, now: Date): string => {
  const seconds = (date.getTime() - now.getTime()) / 1000;

  if (Number.isNaN(seconds)) return '';
  if (Math.abs(seconds) < 1) return 'now';

  const [unit, size] = UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds)!;

  return new Intl.RelativeTimeFormat('en', { style: 'short', numeric: 'always' }).format(
    Math.trunc(seconds / size),
    unit,
  );
};

/** How a date shows on the page. `day` and `month` have no time. */
export type TimeFormat =
  | 'timestamp'
  | 'weekday-timestamp'
  | 'date-time'
  | 'short-date'
  | 'clock'
  | 'zone'
  | 'day'
  | 'month';

export const utcText = (format: TimeFormat, date: Date): string => {
  switch (format) {
    case 'timestamp':
      return utcTimestamp(date);
    case 'weekday-timestamp':
      return utcWeekdayTimestamp(date);
    case 'date-time':
      return `${utcShortDate(date)}, ${utcClock(date)}`;
    case 'short-date':
      return utcShortDate(date);
    case 'clock':
      return utcClock(date);
    case 'zone':
      return 'UTC';
    case 'day':
      return utcDate(date);
    case 'month':
      return utcMonth(date);
  }
};

const DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
const CLOCK: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
const ZONE: Intl.DateTimeFormatOptions = { timeZoneName: 'short' };

const LOCAL_OPTIONS: Partial<Record<TimeFormat, Intl.DateTimeFormatOptions>> = {
  timestamp: { ...DATE, ...CLOCK, ...ZONE },
  'weekday-timestamp': { weekday: 'long', ...DATE, ...CLOCK, ...ZONE },
  'date-time': { ...DATE, ...CLOCK },
  'short-date': DATE,
  clock: CLOCK,
};

/**
 * The text in the zone and with the habits of the visitor. The browser gives
 * both when `locale` and `timeZone` have no value. A day or a month has no
 * time, so it has no local form: the result is null.
 */
export const localText = (
  format: TimeFormat,
  date: Date,
  locale?: string,
  timeZone?: string,
): string | null => {
  if (format === 'day' || format === 'month') return null;

  if (format === 'zone') {
    const parts = new Intl.DateTimeFormat(locale, { ...ZONE, timeZone }).formatToParts(date);
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
  }

  return new Intl.DateTimeFormat(locale, { ...LOCAL_OPTIONS[format], timeZone }).format(date);
};

/** Reads the `datetime` attribute of a <time> element of this site. */
export const parseDatetimeAttribute = (value: string): Date => {
  if (/^\d{4}-\d{2}$/.test(value)) return new Date(`${value}-01T00:00:00Z`);

  return parseInstant(value);
};

/**
 * A date for the page: a <time> element with the UTC text, which needs no
 * script. The name of the format lets the browser write the local form.
 */
export const timeHtml = (format: TimeFormat, date: Date): string => {
  if (Number.isNaN(date.getTime())) return '';

  const datetime =
    format === 'day' ? utcDayStamp(date) : format === 'month' ? utcMonthStamp(date) : date.toISOString();

  return `<time datetime="${datetime}" data-format="${format}">${utcText(format, date)}</time>`;
};

/** A timestamp, and an element that the browser fills with the relative time. */
export const timestampHtml = (date: Date): string => {
  if (Number.isNaN(date.getTime())) return '';

  return `${timeHtml('timestamp', date)}<relative-time datetime="${date.toISOString()}"></relative-time>`;
};
