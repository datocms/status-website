/** Date helpers. Everything is UTC; the site stores ISO strings with milliseconds. */

export const nowIso = () => new Date().toISOString();

const pad = (n: number) => String(n).padStart(2, '0');

/** `2026-09-01 21:27 UTC` */
export const formatUtc = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;

/** `2026-09-01` in UTC, used for file names. */
export const utcDateStamp = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const SHORT_FORM = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Parses user input as a UTC date. Accepts a full ISO string (with `Z` or an
 * offset) or `YYYY-MM-DD HH:mm[:ss]`, read as UTC. Returns null when invalid.
 */
export const parseUtcInput = (input: string): Date | null => {
  const trimmed = input.trim();
  const short = SHORT_FORM.exec(trimmed);
  if (short) {
    const [, y, mo, d, h, mi, s] = short;
    const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, s ? +s : 0));
    // Date.UTC rolls invalid fields over; reject anything that does not round-trip.
    const roundTrips =
      date.getUTCMonth() + 1 === +mo && date.getUTCDate() === +d && date.getUTCHours() === +h && date.getUTCMinutes() === +mi;
    return roundTrips ? date : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/.test(trimmed)) {
    return null;
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Start of the next full hour, the default maintenance start. */
export const nextFullHour = (from = new Date()) => {
  const date = new Date(from);
  date.setUTCMinutes(0, 0, 0);
  date.setUTCHours(date.getUTCHours() + 1);
  return date;
};

/** `3h ago`, `2d ago`, `in 5d` */
export const relativeAge = (date: Date, now = new Date()) => {
  const diffMinutes = Math.round((now.getTime() - date.getTime()) / 60000);
  const abs = Math.abs(diffMinutes);
  const text =
    abs < 60 ? `${abs}m` : abs < 60 * 48 ? `${Math.round(abs / 60)}h` : `${Math.round(abs / 1440)}d`;
  return diffMinutes >= 0 ? `${text} ago` : `in ${text}`;
};
