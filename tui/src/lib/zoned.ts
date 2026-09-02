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

export interface ZoneEntry {
  zone: string;
  /** English country names whose region uses this zone, for search. */
  countries: string[];
}

let zoneIndex: ZoneEntry[] | null = null;

/**
 * Every IANA zone with the countries that use it, built once from Intl:
 * region display names plus `Intl.Locale#getTimeZones` per region.
 */
export const zoneEntries = (): ZoneEntry[] => {
  if (zoneIndex) return zoneIndex;
  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const byZone = new Map<string, string[]>();
  for (const zone of Intl.supportedValuesOf('timeZone')) byZone.set(zone, []);
  byZone.set('UTC', []);
  for (let a = 65; a <= 90; a += 1) {
    for (let b = 65; b <= 90; b += 1) {
      const code = String.fromCharCode(a, b);
      let name: string | undefined;
      try {
        name = names.of(code);
      } catch {
        continue;
      }
      if (!name || name === code || name === 'Unknown Region') continue;
      let zones: string[] = [];
      try {
        // Intl Locale Info API; present in Node 24, not yet in the TS lib types.
        zones = (new Intl.Locale(`en-${code}`) as unknown as { getTimeZones?: () => string[] }).getTimeZones?.() ?? [];
      } catch {
        // region without zone data
      }
      for (const zone of zones) {
        const list = byZone.get(zone) ?? [];
        list.push(name);
        byZone.set(zone, list);
      }
    }
  }
  zoneIndex = [...byZone.entries()].map(([zone, countries]) => ({ zone, countries: countries.sort() }));
  return zoneIndex;
};

/** Case-insensitive match on the zone name or any of its countries. */
export const searchZones = (query: string, entries = zoneEntries()): ZoneEntry[] => {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => e.zone.toLowerCase().includes(q) || e.countries.some((c) => c.toLowerCase().includes(q)));
};

/** Whether the machine's locale writes hours in 12-hour form. */
export const defaultHour12 = () => {
  const cycle = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h12' || cycle === 'h11';
};
