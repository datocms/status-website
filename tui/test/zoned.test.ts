import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampWall, offsetLabel, utcToWall, wallToUtc, zoneChoices } from '../src/lib/zoned.ts';
import * as zonedModule from '../src/lib/zoned.ts';

test('wallToUtc converts Rome summer and winter time', () => {
  assert.equal(wallToUtc({ year: 2026, month: 9, day: 1, hour: 23, minute: 27 }, 'Europe/Rome').toISOString(), '2026-09-01T21:27:00.000Z');
  assert.equal(wallToUtc({ year: 2026, month: 1, day: 15, hour: 10, minute: 0 }, 'Europe/Rome').toISOString(), '2026-01-15T09:00:00.000Z');
  assert.equal(wallToUtc({ year: 2026, month: 9, day: 1, hour: 21, minute: 27 }, 'UTC').toISOString(), '2026-09-01T21:27:00.000Z');
});

test('utcToWall and wallToUtc round-trip across zones', () => {
  const instant = new Date('2026-03-29T00:30:00.000Z');
  for (const zone of ['UTC', 'Europe/Rome', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney']) {
    assert.equal(wallToUtc(utcToWall(instant, zone), zone).toISOString(), instant.toISOString(), zone);
  }
});

test('offsetLabel formats offsets', () => {
  const summer = new Date('2026-09-01T12:00:00.000Z');
  assert.equal(offsetLabel(summer, 'UTC'), 'UTC');
  assert.equal(offsetLabel(summer, 'Europe/Rome'), 'UTC+02:00');
  assert.equal(offsetLabel(summer, 'America/Los_Angeles'), 'UTC-07:00');
  assert.equal(offsetLabel(summer, 'Asia/Kolkata'), 'UTC+05:30');
});

test('clampWall keeps every part in range, including month lengths', () => {
  assert.deepEqual(clampWall({ year: 2026, month: 2, day: 31, hour: 24, minute: -1 }), { year: 2026, month: 2, day: 28, hour: 23, minute: 0 });
  assert.deepEqual(clampWall({ year: 2028, month: 13, day: 31, hour: 0, minute: 0 }), { year: 2028, month: 12, day: 31, hour: 0, minute: 0 });
  assert.equal(clampWall({ year: 2028, month: 2, day: 29, hour: 0, minute: 0 }).day, 29);
});

test('zoneChoices starts with UTC and the local zone, without duplicates', () => {
  const zones = zoneChoices('Europe/Rome');
  assert.equal(zones[0], 'UTC');
  assert.equal(zones[1], 'Europe/Rome');
  assert.equal(new Set(zones).size, zones.length);
});

test('zoneEntries maps zones to countries and searchZones finds by country', () => {
  const { searchZones, zoneEntries } = zonedModule;
  const rome = zoneEntries().find((e) => e.zone === 'Europe/Rome')!;
  assert.ok(rome.countries.includes('Italy'));
  const byCountry = searchZones('italy').map((e) => e.zone);
  assert.ok(byCountry.includes('Europe/Rome'));
  const byName = searchZones('tokyo').map((e) => e.zone);
  assert.deepEqual(byName, ['Asia/Tokyo']);
  assert.ok(searchZones('').length > 400);
});
