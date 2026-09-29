import { describe, expect, it } from 'vitest';
import {
  isSameUtcDay,
  isSameUtcMonth,
  localText,
  monthsBetween,
  parseInstant,
  relativeTime,
  startOfUtcDay,
  startOfUtcMonth,
  subUtcDays,
  subUtcMonths,
  timeHtml,
  timestampHtml,
  utcClock,
  utcDate,
  utcDayStamp,
  utcMonth,
  utcMonthStamp,
  utcShortDate,
  utcText,
  utcTimestamp,
  utcWeekdayTimestamp,
} from '../src/lib/time';

// 23:30 in Los Angeles on Sep 27, 08:30 in Rome and 15:30 in Tokyo on Sep 28.
const instant = new Date('2026-09-28T06:30:48.847Z');

describe('UTC formats', () => {
  it('gives the same text on a machine in any time zone', () => {
    const before = process.env.TZ;

    for (const zone of ['America/Los_Angeles', 'Europe/Rome', 'Asia/Tokyo', 'UTC']) {
      process.env.TZ = zone;
      expect(utcTimestamp(instant), zone).toBe('Sep 28, 06:30 UTC');
      expect(utcDate(instant), zone).toBe('September 28, 2026');
      expect(utcDayStamp(instant), zone).toBe('2026-09-28');
    }

    process.env.TZ = before;
  });

  it('has a format for each use', () => {
    expect(utcTimestamp(instant)).toBe('Sep 28, 06:30 UTC');
    expect(utcWeekdayTimestamp(instant)).toBe('Monday, Sep 28, 06:30 UTC');
    expect(utcShortDate(instant)).toBe('Sep 28');
    expect(utcClock(instant)).toBe('06:30');
    expect(utcDate(instant)).toBe('September 28, 2026');
    expect(utcMonth(instant)).toBe('September 2026');
    expect(utcDayStamp(instant)).toBe('2026-09-28');
    expect(utcMonthStamp(instant)).toBe('2026-09');
  });

  it('pads the hour, the minute and the day stamp', () => {
    const early = new Date('2026-01-05T03:07:00.000Z');

    expect(utcTimestamp(early)).toBe('Jan 5, 03:07 UTC');
    expect(utcDayStamp(early)).toBe('2026-01-05');
  });
});

describe('UTC days and months', () => {
  it('starts a day and a month at midnight UTC', () => {
    expect(startOfUtcDay(instant).toISOString()).toBe('2026-09-28T00:00:00.000Z');
    expect(startOfUtcMonth(instant).toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('puts two instants in the same UTC day, whatever the local day is', () => {
    expect(isSameUtcDay(new Date('2026-09-28T00:00:00.000Z'), new Date('2026-09-28T23:59:59.999Z'))).toBe(true);
    expect(isSameUtcDay(new Date('2026-09-27T23:59:59.999Z'), new Date('2026-09-28T00:00:00.000Z'))).toBe(false);
    expect(isSameUtcMonth(new Date('2026-09-01T00:00:00.000Z'), new Date('2026-09-30T23:59:59.999Z'))).toBe(true);
    expect(isSameUtcMonth(new Date('2026-08-31T23:59:59.999Z'), new Date('2026-09-01T00:00:00.000Z'))).toBe(false);
  });

  it('goes back by days and by months', () => {
    expect(subUtcDays(new Date('2026-03-01T00:00:00.000Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(subUtcMonths(new Date('2026-01-01T00:00:00.000Z'), 2).toISOString()).toBe('2025-11-01T00:00:00.000Z');
    expect(subUtcMonths(new Date('2026-03-01T00:00:00.000Z'), 12).toISOString()).toBe('2025-03-01T00:00:00.000Z');
  });
});

describe('monthsBetween', () => {
  it('counts full months only', () => {
    const between = (from: string, to: string) => monthsBetween(new Date(`${from}T00:00:00Z`), new Date(`${to}T00:00:00Z`));

    expect(between('2026-01-15', '2026-09-28')).toBe(8);
    expect(between('2026-01-28', '2026-09-28')).toBe(8);
    expect(between('2026-01-29', '2026-09-28')).toBe(7);
    expect(between('2019-01-17', '2026-09-28')).toBe(92);
    expect(between('2026-09-01', '2026-09-28')).toBe(0);
  });
});

describe('parseInstant', () => {
  it('reads a date with a zone as that instant', () => {
    expect(parseInstant('2026-09-28T06:30:48.847Z').toISOString()).toBe('2026-09-28T06:30:48.847Z');
    expect(parseInstant('2026-09-11T12:26:33.001-07:00').toISOString()).toBe('2026-09-11T19:26:33.001Z');
  });

  it('reads a date without a zone as UTC, not as the zone of the machine', () => {
    const before = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';

    expect(parseInstant('2026-09-28T06:30:48').toISOString()).toBe('2026-09-28T06:30:48.000Z');
    expect(parseInstant('2026-09-28 06:30').toISOString()).toBe('2026-09-28T06:30:00.000Z');
    expect(parseInstant('2026-09-28').toISOString()).toBe('2026-09-28T00:00:00.000Z');

    process.env.TZ = before;
  });
});

describe('relativeTime', () => {
  const now = new Date('2026-09-28T12:00:00.000Z');
  const ago = (seconds: number) => relativeTime(new Date(now.getTime() - seconds * 1000), now);

  it('uses the short English form', () => {
    expect(ago(2)).toBe('2 sec. ago');
    expect(ago(5 * 60)).toBe('5 min. ago');
    expect(ago(3 * 3600)).toBe('3 hr. ago');
    expect(ago(4 * 86400)).toBe('4 days ago');
    expect(ago(1 * 86400)).toBe('1 day ago');
    expect(ago(7 * 30 * 86400)).toBe('7 mo. ago');
    expect(ago(3 * 365 * 86400)).toBe('3 yr. ago');
  });

  it('changes the unit at the limit, and not before', () => {
    expect(ago(59)).toBe('59 sec. ago');
    expect(ago(60)).toBe('1 min. ago');
    expect(ago(119)).toBe('1 min. ago');
    expect(ago(59 * 60 + 59)).toBe('59 min. ago');
    expect(ago(3600)).toBe('1 hr. ago');
    expect(ago(23 * 3600 + 3599)).toBe('23 hr. ago');
    expect(ago(86400)).toBe('1 day ago');
    expect(ago(29 * 86400)).toBe('29 days ago');
    expect(ago(30 * 86400)).toBe('1 mo. ago');
    expect(ago(364 * 86400)).toBe('12 mo. ago');
    expect(ago(365 * 86400)).toBe('1 yr. ago');
  });

  it('says "now" for the first second', () => {
    expect(ago(0)).toBe('now');
    expect(ago(0.4)).toBe('now');
  });

  it('gives a time in the future', () => {
    expect(ago(-3 * 86400)).toBe('in 3 days');
    expect(ago(-90 * 60)).toBe('in 1 hr.');
    expect(ago(-30)).toBe('in 30 sec.');
  });

  it('gives nothing for a date that is not valid', () => {
    expect(relativeTime(new Date('nope'), now)).toBe('');
  });
});

describe('timeHtml and timestampHtml', () => {
  it('gives the UTC text, the instant, and the name of the format', () => {
    expect(timeHtml('timestamp', instant)).toBe(
      '<time datetime="2026-09-28T06:30:48.847Z" data-format="timestamp">Sep 28, 06:30 UTC</time>',
    );
    expect(timeHtml('clock', instant)).toBe(
      '<time datetime="2026-09-28T06:30:48.847Z" data-format="clock">06:30</time>',
    );
  });

  it('gives a day and a month as a date without a time', () => {
    expect(timeHtml('day', instant)).toBe('<time datetime="2026-09-28" data-format="day">September 28, 2026</time>');
    expect(timeHtml('month', instant)).toBe('<time datetime="2026-09" data-format="month">September 2026</time>');
  });

  it('adds an empty element for the relative time to a timestamp', () => {
    expect(timestampHtml(instant)).toBe(
      '<time datetime="2026-09-28T06:30:48.847Z" data-format="timestamp">Sep 28, 06:30 UTC</time>' +
        '<relative-time datetime="2026-09-28T06:30:48.847Z"></relative-time>',
    );
  });

  it('gives nothing for a date that is not valid', () => {
    expect(timestampHtml(new Date('nope'))).toBe('');
    expect(timeHtml('timestamp', new Date('nope'))).toBe('');
  });
});

describe('utcText', () => {
  it('has a text for each format', () => {
    expect(utcText('timestamp', instant)).toBe('Sep 28, 06:30 UTC');
    expect(utcText('weekday-timestamp', instant)).toBe('Monday, Sep 28, 06:30 UTC');
    expect(utcText('date-time', instant)).toBe('Sep 28, 06:30');
    expect(utcText('short-date', instant)).toBe('Sep 28');
    expect(utcText('clock', instant)).toBe('06:30');
    expect(utcText('zone', instant)).toBe('UTC');
    expect(utcText('day', instant)).toBe('September 28, 2026');
    expect(utcText('month', instant)).toBe('September 2026');
  });
});

describe('localText', () => {
  // Intl puts a narrow no-break space before AM and PM.
  const plain = (text: string | null) => text?.replace(/[\u202f\u00a0]/g, ' ');

  it('uses the zone and the habits of the visitor', () => {
    expect(plain(localText('timestamp', instant, 'en-US', 'America/Los_Angeles'))).toBe('Sep 27, 11:30 PM PDT');
    expect(plain(localText('timestamp', instant, 'en-GB', 'Europe/London'))).toBe('28 Sept, 07:30 BST');
    expect(plain(localText('timestamp', instant, 'it-IT', 'Europe/Rome'))).toBe('28 set, 08:30 CEST');
    expect(plain(localText('timestamp', instant, 'ja-JP', 'Asia/Tokyo'))).toBe('9月28日 15:30 JST');
  });

  it('has a text for each format that has a time', () => {
    const local = (format: Parameters<typeof localText>[0]) => plain(localText(format, instant, 'en-US', 'America/Los_Angeles'));

    expect(local('weekday-timestamp')).toBe('Sunday, Sep 27, 11:30 PM PDT');
    expect(local('date-time')).toBe('Sep 27, 11:30 PM');
    expect(local('short-date')).toBe('Sep 27');
    expect(local('clock')).toBe('11:30 PM');
    expect(local('zone')).toBe('PDT');
  });

  it('cannot give a day or a month, which has no time', () => {
    expect(localText('day', instant, 'en-US', 'America/Los_Angeles')).toBeNull();
    expect(localText('month', instant, 'en-US', 'America/Los_Angeles')).toBeNull();
  });

  it('follows the summer and the winter time of the zone', () => {
    expect(plain(localText('timestamp', new Date('2026-01-15T09:00:00Z'), 'it-IT', 'Europe/Rome'))).toBe('15 gen, 10:00 CET');
    expect(plain(localText('timestamp', new Date('2026-07-15T09:00:00Z'), 'it-IT', 'Europe/Rome'))).toBe('15 lug, 11:00 CEST');
  });
});
