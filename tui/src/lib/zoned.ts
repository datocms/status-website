/** Wall-clock time in an IANA zone to and from UTC instants, via Luxon. */
import { DateTime } from 'luxon';

export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export const localZone = () => DateTime.local().zoneName || 'UTC';

/** Zones offered by the picker: UTC, the machine's zone, then common ones. */
export const zoneChoices = (local = localZone()) =>
  [...new Set(['UTC', local, 'Europe/Rome', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'])];

/** Wall clock of an instant in a zone. */
export const utcToWall = (date: Date, zone: string): WallClock => {
  const dt = DateTime.fromJSDate(date, { zone });
  return { year: dt.year, month: dt.month, day: dt.day, hour: dt.hour, minute: dt.minute };
};

/** `UTC+02:00`, `UTC-07:00`, `UTC` */
export const offsetLabel = (date: Date, zone: string) => {
  const minutes = DateTime.fromJSDate(date, { zone }).offset;
  if (minutes === 0) return 'UTC';
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

/** The instant for a wall-clock time in a zone. Luxon resolves DST gaps and overlaps. */
export const wallToUtc = (wall: WallClock, zone: string): Date =>
  DateTime.fromObject({ ...wall, second: 0, millisecond: 0 }, { zone }).toUTC().toJSDate();

export const daysInMonth = (year: number, month: number) => DateTime.utc(year, month).daysInMonth ?? 31;

/** Clamps every part into range, so arrow adjustments never produce an invalid date. */
export const clampWall = (wall: WallClock): WallClock => {
  const month = Math.min(12, Math.max(1, wall.month));
  const year = Math.min(9999, Math.max(1970, wall.year));
  return {
    year,
    month,
    day: Math.min(daysInMonth(year, month), Math.max(1, wall.day)),
    hour: Math.min(23, Math.max(0, wall.hour)),
    minute: Math.min(59, Math.max(0, wall.minute)),
  };
};
